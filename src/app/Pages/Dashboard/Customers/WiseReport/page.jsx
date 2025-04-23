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
  const [isClient, setIsClient] = useState(false);
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

  useEffect(() => {
    setIsClient(true);
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

        const parties = partyRes.data.map(p => ({
          value: p.id,
          label: p.name,
        }));
        setPartyOptions(parties);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false); // Hide loader after fetching
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
  };

  if (!isClient || loading) {
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
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Customers Wise Report</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mt-4">
        {/* Party Name */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Party Name</label>
          <Select
            isMulti
            value={selectedValue}
            onChange={setSelectedValue}
            options={partyOptions}
            placeholder="Select Party"
            className="w-full mt-2"
          />
        </div>

        {/* Start Date */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

        {/* End Date */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

        {/* Item Name */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Item Name</label>
          <Select
            isMulti
            value={selectedItem}
            onChange={(selected) => {
              if (selected && selected.some(item => item.value === 'all')) {
                setSelectedItem([{ value: 'all', label: 'All' }]);
              } else {
                setSelectedItem(selected || []);
              }
            }}
            options={itemOptions}
            placeholder="Select Item"
            className="w-full mt-2"
          />
        </div>
      </div>

      {/* Search & Reset */}
      <div className="mt-4 flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md"
          onClick={handleSearch}
        >
          Search
        </button>
        <button
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md"
          onClick={() => {
            setFilteredSales(sales);
            setSelectedValue([]);
            setSelectedItem([]);
            setStartDate('');
            setEndDate('');
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {['#', 'Date', 'Vr#', 'Item Name', 'Weight', 'Rate', 'Gross Amount', 'Freight', 'Net Amount'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale, index) => {
                const details = getDetailsForSale(sale.id);
                const firstDetail = details[0] || {};
                const totalWeight = getTotalWeight(details);
                const averageRate = getAverageRate(details);
                const grossAmount = getTotalAmount(details).toFixed(2);
                const freight = parseFloat(sale.frieght || firstDetail.frieght || 0);
                const netAmount = (parseFloat(grossAmount) - freight).toFixed(2);

                return (
                  <tr key={sale.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(sale.sale_date).toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{firstDetail.vehicle_no || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{firstDetail.item_id ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalWeight}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{averageRate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{grossAmount}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{freight || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{netAmount}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center px-6 py-4 text-sm text-gray-700">
                  No sales data found for the applied filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RouteList;
