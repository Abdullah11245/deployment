'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function RouteList() {
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedValue, setSelectedValue] = useState([]);
  const [selectedItem, setSelectedItem] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([
    { value: 'all', label: 'All' },
    { value: '0', label: 'Oil' },
    { value: '1', label: 'Protein' },
  ]);

  const router = useRouter();

  const salesPerPage = 10;
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [saleRes, detailRes, partyRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/sale/getAll'),
          axios.get('https://accounts-management.onrender.com/common/saleDetail/getAll'),
          axios.get('https://accounts-management.onrender.com/common/parties/getAll'),
        ]);

        const fetchedSales = saleRes.data || [];
        setSales(fetchedSales);
        setFilteredSales(fetchedSales);
        setSaleDetails(detailRes.data || []);

        const parties = partyRes.data
          .filter(p => p.status) // ✅ Filter active parties
          .map(p => ({
            value: p.id,
            label: p.name,
          }));
        setPartyOptions(parties);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const getDetailsForSale = (saleId) => saleDetails.filter((detail) => detail.sale_id === saleId);
  const getTotalWeight = (details) => details.reduce((sum, d) => sum + Number(d.weight || 0), 0);
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

  const handleSearch = () => {
    const filtered = sales.filter((sale) => {
      const saleDateOnly = new Date(sale.sale_date).toISOString().split('T')[0];
      const saleDetailsForThisSale = getDetailsForSale(sale.id);

      const partyFilter =
        selectedValue.length === 0 || selectedValue.some(p => p.value === sale.party_id);

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

      return partyFilter && itemFilter && startFilter && endFilter;
    });

    setFilteredSales(filtered);
    setCurrentPage(1); // reset to first page on new search
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
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-4">Customers Wise Report</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Party Name</label>
          <Select isMulti value={selectedValue} onChange={setSelectedValue} options={partyOptions} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-2 px-4 py-2 border rounded-md text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-2 px-4 py-2 border rounded-md text-sm" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Item Name</label>
          <Select
            isMulti
            value={selectedItem}
            onChange={(selected) =>
              selected.some((item) => item.value === 'all')
                ? setSelectedItem([{ value: 'all', label: 'All' }])
                : setSelectedItem(selected)
            }
            options={itemOptions}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm" onClick={handleSearch}>
          Search
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm"
          onClick={() => {
            setFilteredSales(sales);
            setSelectedValue([]);
            setSelectedItem([]);
            setStartDate('');
            setEndDate('');
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {['#', 'Date', 'Vr#', 'Item Name', 'Weight', 'Rate', 'Gross Amount', 'Freight', 'Net Amount'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((sale, index) => {
                const details = getDetailsForSale(sale.id);
                const firstDetail = details[0] || {};
                const totalWeight = getTotalWeight(details);
                const averageRate = getAverageRate(details);
                const grossAmount = getTotalAmount(details).toFixed(2);
                const freight = parseFloat(sale.frieght || firstDetail.frieght || 0);
                const netAmount = (parseFloat(grossAmount) - freight).toFixed(2);

                return (
                  <tr key={sale.id} className="border-t">
                    <td className="px-6 py-4 text-sm">{indexOfFirstSale + index + 1}</td>
                    <td className="px-6 py-4 text-sm">{new Date(sale.sale_date).toISOString().split('T')[0]}</td>
                    <td className="px-6 py-4 text-sm">{firstDetail.vehicle_no || '-'}</td>
                    <td className="px-6 py-4 text-sm">{firstDetail.item_id ?? '-'}</td>
                    <td className="px-6 py-4 text-sm">{totalWeight}</td>
                    <td className="px-6 py-4 text-sm">{averageRate}</td>
                    <td className="px-6 py-4 text-sm">{grossAmount}</td>
                    <td className="px-6 py-4 text-sm">{freight || '-'}</td>
                    <td className="px-6 py-4 text-sm">{netAmount}</td>
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

        <ol className="flex gap-1 text-xs font-medium">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => handlePageChange(i + 1)}
                className={`w-8 h-8 rounded border text-center leading-8 ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default RouteList;
