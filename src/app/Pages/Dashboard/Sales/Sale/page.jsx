'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { json2csv } from 'json-2-csv';
import Link from 'next/link';
import end_points from '../../../../api_url';

function RouteList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedValue, setSelectedValue] = useState([]);
  const [selectedItem, setSelectedItem] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [partyMap, setPartyMap] = useState({});

  const salesPerPage = 50;
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = Array.isArray(filteredSales)
    ? filteredSales.slice(indexOfFirstSale, indexOfLastSale)
    : [];

  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

const [vouchers, setVouchers] = useState([]);

useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const [saleRes, detailRes, itemRes,partiesRes, voucherRes] = await Promise.all([
        axios.get(`${end_points}/sale/getAll`),
        axios.get(`${end_points}/saleDetail/getAll`),
          axios.get(`${end_points}/parties/getAll`),
        axios.get(`${end_points}/items/getAll`),
        axios.get(`${end_points}/voucher/getAll`),
      ]);

      const fetchedSales = saleRes.data || [];
      setSales(fetchedSales);
      setFilteredSales(fetchedSales);
      setSaleDetails(detailRes.data || []);
      setVouchers((voucherRes.data || []).filter(v => v.voucher_type === 'SV'));

      // Fetch each party individually if needed
      const partyIds = [...new Set(fetchedSales.map(sale => sale.party_id))];
      const partyMapTemp = {};

     for (const id of partyIds) {
  try {
    const res = await axios.get(`${end_points}/parties/parties/${id}`);
    partyMapTemp[id] = res.data.name;
  } catch (err) {
    console.error(`Error fetching party ${id}:`, err);
    partyMapTemp[id] = 'Unknown';
  }
}


      setPartyMap(partyMapTemp);

      const saleItems = itemRes.data
        .filter(item => item.type === 'Sale')
        .map(item => ({ value: String(item.id), label: item.name }));
      setItemOptions([{ value: 'all', label: 'All' }, ...saleItems]);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchInitialData();
}, []);


 const findVoucherIdForSale = (saleId) => {
 
    const voucher = vouchers.find(v => Number(v.voucher_id) === Number(saleId));
    return voucher;
  };

  const getDetailsForSale = (saleId) =>
    saleDetails.filter(detail => Number(detail.sale_id) === Number(saleId));

  const getTotalWeight = (details) =>
    details.reduce((sum, d) => sum + Number(d.weight || 0), 0);

  const getAverageRate = (details) => {
    const validRates = details.map(d => Number(d.rate || 0));
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

  const formatPKR = (amount) => {
    const rounded = Math.round(amount);
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  const handleSearch = () => {
    const searchLower = searchTerm.toLowerCase();

    const filtered = sales.filter((sale) => {
      const saleDateOnly = new Date(sale.sale_date).toISOString().split('T')[0];
      const saleDetailsForThisSale = getDetailsForSale(sale.sale_id);
      const firstDetail = saleDetailsForThisSale[0] || {};

      const party = partyOptions.find(p => p.value === sale.party_id);
      const partyName = party ? party.label : '';

      const itemName = firstDetail.item_id === 2 ? 'Oil' : firstDetail.item_id ? 'Protein' : '-';
      const totalWeight = getTotalWeight(saleDetailsForThisSale);
      const averageRate = getAverageRate(saleDetailsForThisSale);
      const grossAmount = getTotalAmount(saleDetailsForThisSale);
      const freight = parseFloat(sale.frieght || firstDetail.frieght || 0);
      const netAmount = grossAmount - freight;

      const allFields = [
        sale.sale_id,
        saleDateOnly,
        partyName,
        firstDetail.vehicle_no,
        itemName,
        totalWeight,
        averageRate,
        grossAmount,
        freight,
        netAmount
      ];

      const matchesSearch = allFields.some(field =>
        String(field).toLowerCase().includes(searchLower)
      );

      const partyFilter =
        selectedValue.length === 0 ||
        selectedValue.some(p => p.value === sale.party_id);

      const selectedItemValues = selectedItem.map(i => i.value);
      const isAllSelected = selectedItemValues.includes('all');

      const itemFilter =
        selectedItem.length === 0 ||
        isAllSelected ||
        selectedItemValues.some(item =>
          saleDetailsForThisSale.some(detail => String(detail.item_id) === item)
        );

      const startFilter = !startDate || saleDateOnly >= startDate;
      const endFilter = !endDate || saleDateOnly <= endDate;

      return partyFilter && itemFilter && startFilter && endFilter && matchesSearch;
    });

    setFilteredSales(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const exportToCSV = async () => {
    try {
      const csv = await json2csv(filteredSales);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
    XLSX.writeFile(workbook, 'sales.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Sales Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['#', 'Date',  'Item', 'Weight', 'Rate','Freight', 'Net Amount']],
      body: filteredSales.map(sale=> {
        const details = getDetailsForSale(sale.sale_id);
        const first = details[0] || {};
        const weight = getTotalWeight(details);
        const rate = getAverageRate(details);
        const gross = getTotalAmount(details);
        const freight = parseFloat(sale.frieght || first.frieght || 0);
        const net = gross - freight;
        return [
          new Date(sale.sale_date).toISOString().split('T')[0],
          first.vehicle_no || '-',
          first.item_id === 2 ? 'Oil' : first.item_id ? 'Protein' : '-',
          weight,
          rate,
          formatPKR(freight),
          formatPKR(net),
        ];
      }),
    });
    doc.save('sales.pdf');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const content = document.querySelector('table').outerHTML;
    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
          th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>${content}</body>
    </html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
        </div>
      </div>
    );
  }

  return (
   <div className="container mx-auto px-4 py-8">
    <div className=' flex justify-between items-center mb-4  border-b'>
      <h2 className="text-xl font-semibold text-gray-700 pb-4 mb-4">Sales Report</h2>
   <div>
     <Link
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            href={'/Pages/Dashboard/Sales/Sale/createSale'}
          >
Sale
          </Link>
   </div>
    </div>

      {/* Filters */}
    

      

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <div className="mt-6 flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">CSV</button>
            <button onClick={exportToExcel} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">Excel</button>
            <button onClick={exportToPDF} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">PDF</button>
            <button onClick={handlePrint} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">Print</button>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-md text-sm w-full max-w-[300px]"
          />
        </div>

        <table className="w-full ">
          <thead className="bg-gray-500">
            <tr>
              {['#', 'Date',  'Item', 'Weight', 'Rate', 'Freight','Vehicle_No.', 'Total'].map(header => (
                <th key={header} className="px-6 py-3 text-left text-sm font-medium text-white uppercase ">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((sale, index) => {
                const details = getDetailsForSale(sale.sale_id);
                const firstDetail = details[0] || {};
                const totalWeight = getTotalWeight(details);
                const averageRate = getAverageRate(details);
                const gross = getTotalAmount(details);
                const freight = parseFloat(sale.frieght || firstDetail.frieght || 0);
                const net = gross - freight;

                return (
                  <tr key={sale.sale_id} className="border-t text-black">
                    <td className="px-6 py-4 text-sm">{indexOfFirstSale + index + 1}</td>
                    <td className="px-6 py-4 text-sm">{new Date(sale.sale_date).toISOString().split('T')[0]}</td>

                      
                                        <td className="px-6 py-4 text-sm w-20">
                      {firstDetail.item_id === 2 ? 'Oil' : firstDetail.item_id ? 'Protein' : '-'}
                    </td>

                    <td className="px-6 py-4 text-sm w-12">{totalWeight}</td>
                    <td className="px-6 py-4 text-sm w-12">{formatPKR(averageRate)}</td>
                    <td className="px-6 py-4 text-sm w-12">{formatPKR(freight)}</td>
                    <td className="px-6 py-4 text-sm w-12">{firstDetail.vehicle_no}</td>
                    <td className="px-6 py-4 text-sm w-12">{formatPKR(net)}</td>
                    

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center px-6 py-4 text-sm text-gray-700">No sales data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <span className="text-sm text-gray-700">
          Showing {indexOfFirstSale + 1} to {Math.min(indexOfLastSale, filteredSales.length)} of {filteredSales.length} entries
        </span>
        <ol className="flex gap-1 text-sm font-medium">
          <li>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900">&lt;</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button onClick={() => handlePageChange(i + 1)} className={`w-8 h-8 rounded border text-center leading-8 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>{i + 1}</button>
            </li>
          ))}
          <li>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900">&gt;</button>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default RouteList;
