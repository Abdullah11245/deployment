'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const itemsPerPage = 10; // Items per page
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll'),
        ]);

        setVouchers(voucherRes.data || []);
        setVoucherDetails(detailRes.data || []);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchData();
  }, []);

  const handleEdit = (voucher) => {
    router.push(`/Pages/Dashboard/Vouchers/Voucher/${voucher.id}`);
  };

  const handleCreateNew = (route) => {
    router.push(`/Pages/Dashboard/Vouchers/Voucher/Create${route}`);
  };

  const getDetailsForVoucher = (voucherId) =>
    voucherDetails.filter((detail) => detail.main_id === voucherId);

  const getTotalDebit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);

  const getTotalCredit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);

  // Calculate the indexes for the current page of data
  const indexOfLastVoucher = currentPage * itemsPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - itemsPerPage;
  const currentVouchers = vouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);

  // Handle pagination page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Vouchers</h2>
        <div className="flex justify-between space-x-2 items-center">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={() => { handleCreateNew('CP_CR') }}
          >
            Create CP CR
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={() => { handleCreateNew('BP_BR') }}
          >
            Create BP BR
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={() => { handleCreateNew('JV_BRV') }}
          >
            Create JV BRV
          </button>
        </div>
      </div>
{/* <div className='flex justify-between items-center'>
        <div className=" flex justify-between items-center space-x-1 mt-8 mb-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Archive
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Delete
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Restore
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Add
          </button>
        </div>

        <div className="relative text-gray-600 border-2 rounded-full">
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
          />
          <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              id="Capa_1"
              x="0px"
              y="0px"
              viewBox="0 0 56.966 56.966"
              style={{ enableBackground: 'new 0 0 56.966 56.966' }}
              xmlSpace="preserve"
              width="512px"
              height="512px"
            >
              <path
                d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23 s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92 c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17 s-17-7.626-17-17S14.61,6,23.984,6z"
              />
            </svg>
          </button>
        </div>
      </div> */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entries</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Debit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Credit</th>
            </tr>
          </thead>
          <tbody>
            {currentVouchers.length > 0 ? (
              currentVouchers.map((voucher, index) => {
                const details = getDetailsForVoucher(voucher.id);
                const totalDebit = getTotalDebit(details);
                const totalCredit = getTotalCredit(details);

                return (
                  <tr key={voucher.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{voucher.voucher_type}-{voucher.voucher_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(voucher.voucher_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{voucher.note}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{details.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalDebit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalCredit.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center px-6 py-4 text-sm text-gray-700">
                  No voucher data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-semibold text-gray-700">
          Showing {indexOfFirstVoucher + 1} to {Math.min(indexOfLastVoucher, vouchers.length)} of {vouchers.length} entries
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

          {[...Array(Math.ceil(vouchers.length / itemsPerPage))].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded border ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(vouchers.length / itemsPerPage)}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
          >
            <span className="sr-only">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherList;
