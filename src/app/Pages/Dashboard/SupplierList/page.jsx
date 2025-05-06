'use client';
import React, { useState, useEffect,useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';

function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/suppliers/getAll');
        console.log( response.data.suppliers); // Log the response data
        if (response.status === 200) {
          setRoutes(response.data.suppliers);
        } else {
          console.error('Failed to fetch routes');
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
    router.push('/Pages/Dashboard/SupplierList/CreateSupplier');
  };

  const handleEdit = (route) => {
    router.push(`/Pages/Dashboard/SupplierList/${route.id}`);
  };
  const matchesSearch = (route, term) => {
    const lowerTerm = term.toLowerCase();
    return (
      route.name?.toLowerCase().includes(lowerTerm) ||
      route.route?.name?.toLowerCase().includes(lowerTerm)
    );
  };
  function decodeMisencodedUrdu(text) {
    // Convert misencoded Latin1 string to UTF-8 correctly
    const bytes = new TextEncoder('iso-8859-1').encode(text);
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return decoded;
  }
  // Calculate the routes for the current page
 
  const filteredRoutes = routes.filter((route) => matchesSearch(route, searchTerm));
  const indexOfLastRoute = currentPage * itemsPerPage;
  const indexOfFirstRoute = indexOfLastRoute - itemsPerPage;
  const currentRoutes = filteredRoutes.slice(indexOfFirstRoute, indexOfLastRoute);
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const exportToCSV = async () => {
    try {
      const csv = await json2csv(routes);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'suppliers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };
  
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(routes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
    XLSX.writeFile(workbook, 'suppliers.xlsx');
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Suppliers List', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Code', 'Name', 'Address', 'Status']],
      body: routes.map((s) => [
        s.code,
        s.name,
        s.address,
        s.status === 1 ? 'Active' : 'Inactive',
      ]),
    });
    doc.save('suppliers.pdf');
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const content = document.querySelector('table').outerHTML;
    printWindow.document.write(`<html><head><title>Print</title></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
        <h2 className="text-xl font-semibold text-gray-700">List of Suppliers</h2>
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
      <div className='flex justify-between items-center'>
        <div className=" flex justify-between items-center space-x-1 mt-8 mb-4">
          <button onClick={exportToCSV}  className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            CSV
          </button>

          <button onClick={exportToPDF} className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            PDF
          </button>

          <button onClick={exportToExcel} className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            EXCEL
          </button>

          <button onClick={handlePrint} className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Print
          </button>
        </div>

        <div className="relative text-gray-600 border-2 rounded-full">
        <input
  type="search"
  name="search"
  placeholder="Search by Supplier or Route"
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Optional: reset to page 1 on new search
  }}
  className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
/>

          
        </div>
      </div>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
  <tr>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Urdu</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Routes</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
  </tr>
</thead>
<tbody>
  {currentRoutes.map((route, index) => (
    <tr key={route.id} className="border-t">
      <td className="px-4 py-2 text-sm text-gray-700">{indexOfFirstRoute + index + 1}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{route.supplier_code}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{route.name}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{route.name_ur}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{route.address}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{route.route?.name || '-'}</td>
      <td className="px-4 py-2 text-sm">
        <span
          className={`${
            route.status === 1
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-200 text-gray-800'
          } px-2 py-1 rounded-md text-xs font-semibold`}
        >
          {route.status === 1 ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-2 text-sm text-gray-700">
        <button
          onClick={() => handleEdit(route)}
          className="bg-gray-200 text-white p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" width="25px" height="25px">
            <path
              d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <span className="text-sm font-semibold text-gray-700">
          Showing {indexOfFirstRoute + 1} to {Math.min(indexOfLastRoute, routes.length)} of {routes.length} entries
        </span>

        <ol className="flex gap-1 text-xs font-medium">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Prev Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => handlePageChange(i + 1)}
                className={`block w-8 h-8 rounded border ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                } text-center leading-8`}
              >
                {i + 1}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default RouteList;
