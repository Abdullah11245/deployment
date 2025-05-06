'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Number of items per page
  const router = useRouter();
  const [partyNames, setPartyNames] = useState({});
  const [itemNames, setItemNames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPartyName = async (partyId) => {
    if (!partyId) return '';
    if (partyNames[partyId]) return partyNames[partyId]; // Return from cache
  
    try {
      const response = await axios.get(`https://accounts-management.onrender.com/common/parties/parties/${partyId}`);
      const name = response.data?.name || 'Unknown';
      setPartyNames(prev => ({ ...prev, [partyId]: name }));
      return name;
    } catch (error) {
      console.error(`Error fetching party ${partyId}:`, error);
      return 'Unknown';
    }
  };

  const fetchItemName = async (itemId) => {
    if (!itemId) return '';
    if (itemNames[itemId]) return itemNames[itemId]; // Return from cache
  
    try {
      const response = await axios.get(`https://accounts-management.onrender.com/common/items/items/${itemId}`);
      const name = response.data?.name || 'Unknown';
      setItemNames(prev => ({ ...prev, [itemId]: name }));
      return name;
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error);
      return 'Unknown';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, detailRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/sale/getAll'),
          axios.get('https://accounts-management.onrender.com/common/saleDetail/getAll'),
        ]);
    
        const saleData = saleRes.data || [];
        const detailData = detailRes.data || [];
    
        // Fetch party names
        const uniquePartyIds = [...new Set(saleData.map(s => s.party_id))];
        const partyNameResults = await Promise.all(uniquePartyIds.map(id => fetchPartyName(id)));
        const newPartyCache = {};
        uniquePartyIds.forEach((id, idx) => {
          newPartyCache[id] = partyNameResults[idx];
        });
        setPartyNames(newPartyCache);
    
        // Fetch item names
        const uniqueItemIds = [...new Set(detailData.map(d => d.item_id))];
        const itemNameResults = await Promise.all(uniqueItemIds.map(id => fetchItemName(id)));
        const newItemCache = {};
        uniqueItemIds.forEach((id, idx) => {
          newItemCache[id] = itemNameResults[idx];
        });
        setItemNames(newItemCache);
    
        setSales(saleData);
        setSaleDetails(detailData);
      } catch (err) {
        console.error('Error fetching sales data:', err);
      }
    };
    fetchData();  
  }, []);

  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };

  const exportCSV = async () => {
    try {
      const csv = await json2csv(filteredSales);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('CSV Export Error:', error);
    }
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
    XLSX.writeFile(workbook, 'sales.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredSales.map(sale => {
      const details = getDetailsForSale(sale.id);
      const totalWeight = getTotalWeight(details);
      const averageRate = getAverageRate(details);
      const totalAmount = getTotalAmount(details).toFixed(2);
      const itemList = details.map(d => itemNames[d.item_id] || d.item_id).join(', ');
      return [
        new Date(sale.sale_date).toLocaleDateString(),
        partyNames[sale.party_id] || sale.party_id,
        sale.tax_percentage,
        itemList,
        totalWeight,
        averageRate,
        totalAmount
      ];
    });

    autoTable(doc, {
      head: [['Date', 'Party', 'Tax (%)', 'Items', 'Weight', 'Rate', 'Total']],
      body: tableData,
    });

    doc.save('sales.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUniversalSearch = (value) => {
    setSearchQuery(value);
  };

  const getDetailsForSale = (saleId) => {
    return saleDetails.filter((detail) => detail.sale_id === saleId);
  };

  const getTotalWeight = (details) =>
    details.reduce((sum, d) => sum + Number(d.weight || 0), 0);

  const getAverageRate = (details) => {
    const validRates = details.map((d) => Number(d.rate || 0));
    return validRates.length > 0
      ? (validRates.reduce((sum, r) => sum + r, 0) / validRates.length).toFixed(2)
      : '0';
  };

  const getTotalAmount = (details) =>
    details.reduce((sum, d) => {
      const weight = parseFloat(d.weight) || 0;
      const rate = parseFloat(d.rate) || 0;
      const adjustment = parseFloat(d.adjustment) || 0;
      return sum + (weight * rate + adjustment);
    }, 0);

  const handleEdit = (sale, detail) => {
    console.log(detail);
    router.push(`/Pages/Dashboard/Sales/Sale/${sale.id}/${detail.item_id}`);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Filter the sales based on the search query
  const filteredSales = currentSales.filter(sale => {
    const details = getDetailsForSale(sale.id);
    const itemNamesList = details.map(d => itemNames[d.item_id] || '').join(' ');
    const partyName = partyNames[sale.party_id] || '';
    const totalAmount = getTotalAmount(details);

    const searchContent = `${sale.id} ${sale.party_id} ${partyName} ${itemNamesList} ${totalAmount}`;
    return searchContent.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Sales</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          onClick={() => router.push('/Pages/Dashboard/Sales/Sale/createSale')}
        >
          Create New
        </button>
      </div>
      <div className="flex justify-between items-center mt-8 mb-4">
        <div className="flex space-x-1">
          <button onClick={exportCSV} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">CSV</button>
          <button onClick={exportExcel} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Excel</button>
          <button onClick={exportPDF} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">PDF</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Print</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleUniversalSearch(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale, index) => {
                const details = getDetailsForSale(sale.id);
                const totalWeight = getTotalWeight(details);
                const averageRate = getAverageRate(details);
                const totalAmount = getTotalAmount(details);

                return (
                  <tr key={sale.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {partyNames[sale.party_id] || sale.party_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sale.tax_percentage}%</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {details.map(d => itemNames[d.item_id] || d.item_id).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrencyPK(totalWeight)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrencyPK(averageRate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrencyPK(totalAmount.toFixed(2))}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="relative">
                        <button
                          onClick={() => handleEdit(sale, details[0])}
                          className="bg-gray-200 text-white p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
                        >
                          <svg viewBox="0 0 24 24" fill="none" width="25px" height="25px">
            <path
              d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No sales found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SaleList;
