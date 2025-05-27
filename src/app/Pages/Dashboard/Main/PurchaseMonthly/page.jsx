'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import end_points from '../../../api_url';

function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${end_points}/monthlyPurchase/getAll`);
        console.log(response.data)
        if (response.data) {
          setRoutes(response.data);
        } else {
          console.error('No data found');
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleCreateNew = () => {
    router.push('/Pages/Dashboard/Main/PurchaseMonthly/CreateMonthly');
  };

  const toggleEditMenu = (rowId) => {
    setActiveRow(activeRow === rowId ? null : rowId);
  };

  const handleEdit = (route) => {
    alert(`Edit ${route.purchase_month}`);
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
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Purchase Files</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center"
          onClick={handleCreateNew}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            />
          </svg>
          Create New
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month/Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t">
<td className="px-6 py-4 text-sm text-gray-700">
  {new Date(route.purchase_month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })}
</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`${
                      route.process === 'Y' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                    } px-2 py-1 rounded-md text-xs font-semibold`}
                  >
                    {route.process === 'Y' ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="relative">
                    <button
                    disabled
                      onClick={() => toggleEditMenu(route.id)}
                      className="bg-gray-200 text-gray-800 rounded-full p-2 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d={
                            activeRow === route.id
                              ? "M17.293 3.293a1 1 0 00-1.414 0L11 7.586 8.707 5.293a1 1 0 00-1.414 1.414L9.586 9l-2.293 2.293a1 1 0 001.414 1.414L11 10.414l2.293 2.293a1 1 0 001.414-1.414L12.414 9l3.707-3.707a1 1 0 000-1.414z"
                              : "M15.232 2.768a3 3 0 014.24 4.24L6.293 15.707a1 1 0 01-.383.267l-4 1a1 1 0 01-1.268-1.268l1-4a1 1 0 01.267-.383L12.768 4.768a3 3 0 014.24 0z"
                          }
                        />
                      </svg>
                    </button>
                    {activeRow === route.id && (
                      <div className="absolute bg-white shadow-md rounded-md mt-2 -top-2 left-10 w-16">
                        <button
                          className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                          onClick={() => handleEdit(route)}
                        >
                          edit
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section - optional functionality, not wired to backend */}
      <div className="flex justify-between items-center mt-8">
        <span className="text-sm font-semibold text-gray-700">
          Showing 1 to {routes.length} of {routes.length} entries
        </span>
        <ol className="flex gap-1 text-xs font-medium">
          {[1, 2, 3, 4].map((page) => (
            <li key={page}>
              <a
                href="#"
                className={`block w-8 h-8 rounded border ${currentPage === page ? 'bg-blue-600 text-white' : 'border-gray-300'} text-center leading-8 text-gray-900`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default RouteList;
