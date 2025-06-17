'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import end_points from '../../../../api_url';
import Link from 'next/link';
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

  const pageSize = 200;

  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes] = await Promise.all([
          axios.get(`${end_points}/voucher/getAll`),
          axios.get(`${end_points}/voucherDetail/getAll`),
        ]);

        setRoutes(voucherRes.data || []);
        setOriginalRoutes(voucherRes.data || []);
        setVoucherDetails(detailRes.data || []);
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
  const fetchNamesInBulk = async () => {
    if (!voucherDetails.length) return;

    setLoading(true);

    try {
      const [partyRes, bankRes, supplierRes] = await Promise.all([
        axios.get(`${end_points}/parties/getAll`),
        axios.get(`${end_points}/banks/getAll`),
        axios.get(`${end_points}/suppliers/getAll`), // slower but included
      ]);

      const partyMap = {};
      const bankMap = {};
      const supplierMap = {};

      const initials = [
        { account_title: 'Cash', account_code: '1110001' },
        { account_title: "Sales Tax ()", account_code: "2120001" },
        { account_title: "Adjusted Balances ()", account_code: "5110001" },
        {account_title:"Inventory",account_code:"1140001"},
        {account_title:'Deduction of W.H.T by Azhar Corp. (Pvt.) Ltd.',account_code:'1150001'},

        {account_title:"Deduction of W.H.T by Salva Feed (Pvt.) Ltd. ",account_code:'1150002'},
        {account_title:"Deduction of W.H.T by Sadiq Feed (Pvt.) Ltd.", account_code:"1150003"}
        
      ];

      // Build party map
      for (const party of partyRes.data || []) {
        if (party.party_code && party.name) {
          partyMap[party.party_code] = party.name;
        }
      }

      // Combine bankRes data with the initials array and build bank map
      const allBanks = [...bankRes.data, ...initials];
      for (const bank of allBanks) {
        if (bank.account_code && bank.account_title) {
          bankMap[bank.account_code] = bank.account_title;
        }
      }

      // Build supplier map
      for (const supplier of supplierRes.data.suppliers || []) {
        if (supplier.supplier_code && supplier.name) {
          supplierMap[supplier.supplier_code] = supplier.name;
        }
      }

      // Combine into nameMap based on voucherDetails
      const nameMap = {};
      for (const detail of voucherDetails) {
        const code = detail.account_code;
        if (partyMap[code]) {
          nameMap[code] = partyMap[code];
        } else if (bankMap[code]) {
          nameMap[code] = bankMap[code];
        } else if (supplierMap[code]) {
          nameMap[code] = supplierMap[code];
        } else {
          nameMap[code] = 'Unknown';
        }
      }

      // Update state with the combined names
      setPartyNames(nameMap); // Or set a state variable for nameMap if needed
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }

    setLoading(false);
  };

  fetchNamesInBulk();
}, [voucherDetails]);





  const getDetailsForVoucher = (voucherId) =>
    voucherDetails.filter((detail) => detail.main_id === voucherId);

  const getTotalDebit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);

  const getTotalCredit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);

  const handleSearch = () => {
    let filteredData = [...originalRoutes];

    if (startDate) {
      filteredData = filteredData.filter((route) => {
        const routeDate = new Date(route.voucher_date).toISOString().split('T')[0];
        return routeDate >= startDate;
      });
    }

    if (endDate) {
      filteredData = filteredData.filter((route) => {
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
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]" />
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(routes.length / pageSize);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const indexOfFirstVoucher = (currentPage - 1) * pageSize;
  const indexOfLastVoucher = Math.min(indexOfFirstVoucher + pageSize, routes.length);
  const paginatedRoutes = routes.slice(indexOfFirstVoucher, indexOfLastVoucher);
 const getVoucherLink = (voucher) => {
    const { voucher_type, id, voucher_id } = voucher;

    if (voucher_type === 'PV') {
      return `/Pages/Dashboard/Vouchers/Voucher/PV/${voucher_id}/${id}`;
    } else if (voucher_type === 'BP' || voucher_type === 'BR') {
      return `/Pages/Dashboard/Vouchers/Voucher/BP_BR/${id}/${voucher_id}`;
    } else if (voucher_type === 'CP' || voucher_type === 'CR') {
      return `/Pages/Dashboard/Vouchers/Voucher/CP_CR/${id}/${voucher_id}`;
    } else if (voucher_type === 'JV' || voucher_type === 'BRV') {
      return `/Pages/Dashboard/Vouchers/Voucher/JV_BRV/${id}/${voucher_id}`;
    }
    else {
      return `/Pages/Dashboard/Vouchers/Voucher/${voucher_type}/${id}/${voucher_id}`;
    }
  };
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
          <thead className="bg-gray-500">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Voucher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Party</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Particulars</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Debit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Credit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoutes.length > 0 ? (
              paginatedRoutes.map((route, index) => {
                const details = getDetailsForVoucher(route.id);
                const debit = getTotalDebit(details);
                const credit = getTotalCredit(details);
                const accountCode = details[0]?.account_code;

                return (
                  <tr key={route.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <Link
                        className='hover:bg-gray-100 px-6 py-3 text-blue-500'
                        href={getVoucherLink(route)}
                      >
                        {route.voucher_type}-{route.voucher_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(route.voucher_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                    {partyNames[accountCode] || 'Unknown'}

                    </td>

                   <td className="px-6 py-4 text-sm text-gray-700">
                     {details[0]?.particulars || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatCurrencyPK(debit)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatCurrencyPK(credit)}
                    </td>
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
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm font-semibold text-gray-700">
            Showing {indexOfFirstVoucher + 1} to {indexOfLastVoucher} of {routes.length} entries
          </span>
          <div className="flex gap-2 text-xs font-medium">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Previous</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePageChange(idx + 1)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded border ${
                  currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receiptreport;
