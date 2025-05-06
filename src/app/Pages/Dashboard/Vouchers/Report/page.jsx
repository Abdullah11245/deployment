'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Receiptreport() {
  const [routes, setRoutes] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [originalRoutes, setOriginalRoutes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [partyNames, setPartyNames] = useState({});
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll')
        ]);

        setRoutes(voucherRes.data || []);
        setVoucherDetails(detailRes.data || []);
        setOriginalRoutes(voucherRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
        setIsClient(true);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchAccountNames = async () => {
      if (!voucherDetails.length) return;
  
      const uniqueCodes = [
        ...new Set(voucherDetails.map((detail) => detail.account_code).filter(Boolean)),
      ];
  
      const nameMap = {};
      setLoading(true)
      await Promise.all(
       
        uniqueCodes.map(async (code) => {
        
          try {
            const supplierRes = await axios.get(
              `https://accounts-management.onrender.com/common/suppliers/supplier/${code}`
            );
            if (supplierRes.data.suppliers.name) {
              nameMap[code] = supplierRes.data.suppliers.name;
              return;
            }
          } catch {}
  
          try {
            const partyRes = await axios.get(
              `https://accounts-management.onrender.com/common/parties/partybyCode/${code}`
            );
            if (partyRes.data?.name) {
              nameMap[code] = partyRes.data.name;
              return;
            }
          } catch {}
  
          try {
            const bankRes = await axios.get(
              `https://accounts-management.onrender.com/common/banks/bank/${code}`
            );
            if (bankRes.data?.account_title) {
              nameMap[code] = bankRes.data.account_title;
              return;
            }
          } catch {}
  
          nameMap[code] = 'Unknown';
        })
      );
  
      setPartyNames(nameMap);
     
    };
    fetchAccountNames();
    setLoading(false)
  }, [voucherDetails.length]);
  
  
  const getDetailsForVoucher = (voucherId) =>
    voucherDetails.filter((detail) => detail.main_id === voucherId);

  const getTotalDebit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);

  const handleSearch = () => {
    let filteredData = [...originalRoutes];

    if (startDate) {
      filteredData = filteredData.filter(route => {
        const routeDate = new Date(route.voucher_date).toISOString().split('T')[0];
        return routeDate >= startDate;
      });
    }

    if (endDate) {
      filteredData = filteredData.filter(route => {
        const routeDate = new Date(route.voucher_date).toISOString().split('T')[0];
        return routeDate <= endDate;
      });
    }

    setRoutes(filteredData);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setRoutes(originalRoutes);
    setCurrentPage(1);
  };

  if (!isClient || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex space-x-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
        </div>
      </div>
    );
  }

  const pageSize = 50;
  const paginatedRoutes = routes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4 border-b-2 pb-2">
        <h2 className="text-xl font-semibold text-gray-700">Receipt Report</h2>
      </div>

      {/* Date Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-900">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-4">
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoutes.length > 0 ? (
              paginatedRoutes.map((route, index) => {
                const details = getDetailsForVoucher(route.id);
                const totalAmount = getTotalDebit(details).toFixed(2);

                return (
                  <tr key={route.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{route.voucher_type}-{route.voucher_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(route.voucher_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
  {(() => {
    const details = getDetailsForVoucher(route.id);
    const accountCode = details[0]?.account_code;
    return partyNames[accountCode] || 'N/A';
  })()}
</td>

                    <td className="px-6 py-4 text-sm text-gray-700">{route.note}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatCurrencyPK(totalAmount)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No data found for the applied filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {Math.ceil(routes.length / pageSize)}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(Math.ceil(routes.length / pageSize), currentPage + 1))}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receiptreport;
