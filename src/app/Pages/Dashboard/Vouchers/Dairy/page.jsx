'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function Diary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  if (loading) return <div className="p-8 text-gray-700">Loading diary vouchers...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Diary Vouchers</h2>
        <button
          onClick={() => router.push('/Pages/Dashboard/Vouchers/Dairy/creatDairyVoucher')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Create New
        </button>
      </div>

      {/* Actions and Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">Archive</button>
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">Delete</button>
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">Restore</button>
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">Add</button>
        </div>

        <div className="relative">
          <input
            type="search"
            placeholder="Search"
            className="bg-white h-10 px-5 pr-10 rounded-full border border-gray-300 text-sm focus:outline-none"
          />
          <button type="submit" className="absolute right-0 top-0 mt-2 mr-4">
            <svg className="h-4 w-4 text-gray-500" viewBox="0 0 56.966 56.966" fill="currentColor">
              <path d="M55.146,51.887L41.588,37.786..." />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Issue Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Cheque Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Cheque No.</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Bank</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Particulars</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <tr key={entry.id || index} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.issue_date?.split('T')[0]}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_date?.split('T')[0]}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_no}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_amount}</td>
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
          Showing {data.length > 0 ? 1 : 0} to {data.length} of {data.length} entries
        </span>
        <div className="flex space-x-2 text-sm">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? 'bg-blue-500 text-white' : 'border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Diary;
