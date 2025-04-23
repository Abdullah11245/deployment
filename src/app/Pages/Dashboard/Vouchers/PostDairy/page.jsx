'use client'
import React, { useState } from 'react';

function PostDairy() {
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const routes = [
    {
      id: 1,
      issueDate: '2025-02-01',
      chequeDate: '2025-02-05',
      chequeNo: '123456',
      amount: 1000,
      bankName: 'Bank ABC',
      partyName: 'Party XYZ',
      route: '/home'
    },
    {
      id: 2,
      issueDate: '2025-02-02',
      chequeDate: '2025-02-06',
      chequeNo: '654321',
      amount: 2000,
      bankName: 'Bank XYZ',
      partyName: 'Party ABC',
      route: '/about'
    },
    // Add more routes as needed
  ];

  const handleCreateNew = () => {
    alert('Create New Route');
  };

  const toggleEditMenu = (rowId) => {
    if (activeRow === rowId) {
      setActiveRow(null);
    } else {
      setActiveRow(rowId);
    }
  };

  const handleEdit = (route) => {
    alert(`Edit route for ${route.route}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Create New Button */}
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Post Dairy Vouchers</h2>
        
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheque Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheque No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t">
                <td className="px-6 py-4 text-sm text-gray-700">{route.issueDate}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.chequeDate}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.chequeNo}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.bankName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.partyName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.route}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
        <div className='p-4'>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          onClick={handleCreateNew}
        >
         Post to Voucher
        </button>
        </div>
        
      </div>

      {/* Pagination and Entry Count */}
      <div className="flex justify-between items-center mt-4">
        {/* Showing 1 to 200 of 517 entries */}
        <span className="text-sm font-semibold text-gray-700">
          Showing 1 to 200 of 517 entries
        </span>

        {/* Pagination Controls on the Right */}
        <ol className="flex gap-1 text-xs font-medium">
          <li>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded border  w-8 h-8 border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Prev Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </li>

          {/* Pagination Pages */}
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

          <li>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded border border-gray-300 w-8 h-8 bg-white text-gray-900"
            >
              <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default PostDairy;
