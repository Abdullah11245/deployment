'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function Diary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Number of items per page (you can adjust this)
  const router = useRouter();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://accounts-management.onrender.com/common/diaryVoucher/getAll');
        const result = await res.json();
       
        setData(result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  if (loading) return <div className="flex justify-center items-center h-screen">
  <div className="flex space-x-2">
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
  </div>
</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Diary Vouchers</h2>
        <button
          onClick={() => router.push('/Pages/Dashboard/Vouchers/Dairy/creatDairyVoucher')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Create New
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-500 text-white">
            <tr className=''>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">#</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Issue Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Cheque Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Cheque No.</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Bank</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Supplier</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Particulars</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((entry, index) => (
              <tr key={entry.id || index} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm text-gray-700">{indexOfFirstItem + index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.issue_date?.split('T')[0]}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_date?.split('T')[0]}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_no}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{formatCurrencyPK(entry.cheque_amount)}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.bank_code}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.supplier_code}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.particulars}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {totalItems} entries
        </span>
        <div className="flex space-x-2 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Prev Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded ${
                index + 1 === currentPage ? 'bg-blue-500 text-white' : 'border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={currentPage === totalPages}
          >
 <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>          </button>
        </div>
      </div>
    </div>
  );
}

export default Diary;
