'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';


function PostDairy() {
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entriesPerPage = 20;
  const totalEntries = routes.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = routes.slice(indexOfFirstEntry, indexOfLastEntry);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/diaryVoucher/getAll');
        if (response.status === 200) {
          setRoutes(response.data);
        }
      } catch (error) {
        setError('Failed to fetch data');
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);


  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'A' ? 'P' : 'A';
    try {
      const response = await axios.put(`https://accounts-management.onrender.com/common/diaryVoucher/diary/${id}`, {
        dv_status: newStatus
      });

      if (response.status === 200) {
        setRoutes((prevRoutes) =>
          prevRoutes.map((route) =>
            route.id === id ? { ...route, dv_status: newStatus } : route
          )
        );
        toast.success(`Status updated to ${newStatus === 'A' ? 'Active' : 'Posted'}`);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status', error);
      toast.error('An error occurred while updating the status');
    }
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
      <Toaster position="top-right" reverseOrder={false} />      

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Post Dairy Vouchers</h2>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheque Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheque No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((route) => (
              <tr key={route.id} className="border-t">
                <td className="px-6 py-4 text-sm text-gray-700">{route.issue_date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.cheque_date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.cheque_no}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.cheque_amount}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.particulars}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.supplier_code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <label htmlFor={`toggle-${route.id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        id={`toggle-${route.id}`}
                        type="checkbox"
                        checked={route.dv_status === 'A'}
                        onChange={() => toggleStatus(route.id, route.dv_status)}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full ${route.dv_status === 'A' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          route.dv_status === 'A' ? 'transform translate-x-6' : ''
                        }`}
                      ></div>
                    </div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <div className='p-4'>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={handleCreateNew}
          >
            Post to Voucher
          </button>
        </div> */}
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-semibold text-gray-700">
          Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
        </span>

        <ol className="flex gap-1 text-xs font-medium">
          <li>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900 disabled:opacity-50"
            >
              <span className="sr-only">Prev Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.707 14.707a1 1 0 01-1.414 0L7.293 10.707a1 1 0 010-1.414L11.293 5.293a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" />
              </svg>
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li key={i}>
              <button
                onClick={() => setCurrentPage(i + 1)}
                className={`block w-8 h-8 rounded border text-center leading-8 ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border-gray-300 text-gray-900'
                }`}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900 disabled:opacity-50"
            >
              <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 001.414 0L12.707 10.707a1 1 0 000-1.414L8.707 5.293a1 1 0 00-1.414 1.414L10.586 10l-3.293 3.293a1 1 0 000 1.414z" />
              </svg>
            </button>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default PostDairy;
