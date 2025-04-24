'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Number of items per page
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, detailRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/sale/getAll'),
          axios.get('https://accounts-management.onrender.com/common/saleDetail/getAll'),
        ]);
        setSales(saleRes.data || []);
        setSaleDetails(detailRes.data || []);
      } catch (err) {
        console.error('Error fetching sales data:', err);
      }
    };

    fetchData();
  }, []);

  const getDetailsForSale = (saleId) => {
    return saleDetails.filter((detail) => detail.sale_id === saleId);
  };

  const getTotalWeight = (details) =>
    details.reduce((sum, d) => sum + Number(d.weight || 0), 0);

  const getAverageRate = (details) => {
    const validRates = details.map((d) => Number(d.rate || 0));
    return validRates.length > 0
      ? (validRates.reduce((sum, r) => sum + r, 0) / validRates.length).toFixed(2)
      : '0';
  };

  const getTotalAmount = (details) =>
    details.reduce((sum, d) => {
      const weight = parseFloat(d.weight) || 0;
      const rate = parseFloat(d.rate) || 0;
      const adjustment = parseFloat(d.adjustment) || 0;
      return sum + (weight * rate + adjustment);
    }, 0);

  const handleEdit = (sale, detail) => {
    console.log(detail);
    router.push(`/Pages/Dashboard/Sales/Sale/${sale.id}/${detail.item_id}`);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Sales</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          onClick={() => router.push('/Pages/Dashboard/Sales/Sale/createSale')}
        >
          Create New
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((sale, index) => {
                const details = getDetailsForSale(sale.id);
                const totalWeight = getTotalWeight(details);
                const averageRate = getAverageRate(details);
                const totalAmount = getTotalAmount(details);

                return (
                  <tr key={sale.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sale.party_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sale.tax_percentage}%</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{details.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalWeight}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{averageRate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="relative">
                        <button
                          onClick={() => handleEdit(sale, details[0])}
                          className="bg-gray-200 text-white p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
                        >
                          <svg viewBox="0 0 24 24" fill="none" width="25px" height="25px">
                            <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center px-6 py-4 text-sm text-gray-700">
                  No sales data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-semibold text-gray-700">
          Showing {sales.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sales.length)} of {sales.length} entries
        </span>

        <ol className="flex gap-1 text-xs font-medium">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Prev Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page}>
              <button
                onClick={() => handlePageChange(page)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded border ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
              >
                {page}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default SaleList;
