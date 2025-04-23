'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Import axios

function RouteList() {
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [routes, setRoutes] = useState([]); // State to store routes data from the API
  const router = useRouter();

  useEffect(() => {
    // Fetch the supplier data from the API
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/suppliers/getAll');
           console.log(response?.data)
        if (response?.status === 200) {
          setRoutes(response?.data); // Update state with API data
        } else {
          console.error('Failed to fetch routes');
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };

    fetchRoutes();
  }, []); // Empty dependency array to only run on component mount

  const handleCreateNew = () => {
    router.push('/Pages/Dashboard/SupplierList/CreateSupplier');
  };

  const toggleEditMenu = (rowId) => {
    if (activeRow === rowId) {
      setActiveRow(null);
    } else {
      setActiveRow(rowId);
    }
  };

  const handleEdit = (route) => {
    router.push(`/Pages/Dashboard/SupplierList/${route.id}`); // Redirect to edit page with route ID
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Create New Button */}
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

      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center space-x-1 mt-8 mb-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            CSV
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Excel
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            PDF
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Print
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
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Urdu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Routes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {routes?.suppliers?.map((route, index) => (
              <tr key={route.id} className="border-t">
                <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route?.supplier_code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route?.name_ur}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route?.address}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route?.route?.name}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`${
                      route?.status === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                    } px-2 py-1 rounded-md text-xs font-semibold`}
                  >
                    {route?.status==1 ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                <div className="relative">
                      <button
                         onClick={() => handleEdit(route)}
                        className="bg-gray-200 text-white p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
                      >
                   
                   <svg viewBox="0 0 24 24" fill="none" width="25px" height="25px">
                            <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      
                      </button>
                      
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default RouteList;
