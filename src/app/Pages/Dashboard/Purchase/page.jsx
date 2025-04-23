'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Purchase = () => {
  const [mergedData, setMergedData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/Pages/Dashboard/Purchase/CreatePurchase');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsRes, purchasesRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/purchaseDetail/getAll'),
          axios.get('https://accounts-management.onrender.com/common/purchase/getAll'),
        ]);

        const details = detailsRes.data || [];
        const purchases = purchasesRes.data || [];
        console.log('Details:', details);
        console.log('Purchases:', purchases);
        const merged = purchases.map((purchase) => {
          const detailsForPurchase = details.filter(
            (detail) => detail.purchase_id === purchase.id
          );
          return {
            ...purchase,
            details: detailsForPurchase,
          };
        });

        setMergedData(merged);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (purchase) => {
    if (purchase.details.length > 1) {
      setSelectedPurchase(purchase);
      setShowModal(true);
    } else {
      router.push(`/Pages/Dashboard/Purchase/${purchase.id}/${purchase.details[0].supplier_id}`);
    }
  };

  const handleEditModal = (purchaseId, supplierId) => {
    router.push(`/Pages/Dashboard/Purchase/${purchaseId}/${supplierId}`);
  };

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (selectedPurchase) {
        try {
          const supplierIds = selectedPurchase.details.map((d) => d.supplier_id);
          const uniqueSupplierIds = [...new Set(supplierIds)];

          const responses = await Promise.all(
            uniqueSupplierIds.map((id) =>
              axios.get(`https://accounts-management.onrender.com/common/suppliers/suppliers/${id}`)
            )
          );

          const supplierMap = responses.reduce((acc, res) => {
            const supplier = res.data.supplier;
            acc[supplier.id] = supplier;
            return acc;
          }, {});

          setSupplierDetails(supplierMap);
        } catch (err) {
          console.error('Error fetching supplier details:', err);
        }
      }
    };

    fetchSupplierDetails();
  }, [selectedPurchase]);

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
        <h2 className="text-xl font-semibold text-gray-700">List of Entries</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          onClick={handleCreateNew}
        >
          Create New
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th>#</th>
              <th>To Date</th>
              <th>Items</th>
              <th>Routes</th>
              <th>No. of Suppliers</th>
              <th>Qty (من)</th>
              <th>Rate</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.length > 0 ? (
              mergedData.map((entry, index) => {
                const validDetails = entry.details.filter(
                  (d) => !isNaN(Number(d.qty)) && !isNaN(Number(d.rate))
                );

                const totalQty = validDetails.reduce(
                  (sum, d) => sum + Number(d.qty),
                  0
                );

                const totalAmount = validDetails.reduce(
                  (sum, d) => sum + Number(d.qty) * Number(d.rate),
                  0
                );

                const avgRate =
                  validDetails.length > 0
                    ? (
                        validDetails.reduce((sum, d) => sum + Number(d.rate), 0) /
                        validDetails.length
                      ).toFixed(2)
                    : '0';

                const itemNames = [...new Set(entry.details.map(d => d.item_name))].join(', ') || 'N/A';
                const routeNames = [...new Set(entry.details.map(d => d.route_name))].join(', ') || 'N/A';

                return (
                  <tr key={entry.id} className="border-t">
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4 text-sm">{new Date(entry.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{itemNames}</td>
                    <td className="px-6 py-4 text-sm">{routeNames}</td>
                    <td className="px-6 py-4 text-sm">{entry.details.length}</td>
                    <td className="px-6 py-4 text-sm">{totalQty}</td>
                    <td className="px-6 py-4 text-sm">{avgRate}</td>
                    <td className="px-6 py-4 text-sm">{totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="bg-gray-200 p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
                      >
                        <svg viewBox="0 0 24 24" fill="none" width="25px" height="25px">
                            <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center px-6 py-4 text-sm text-gray-700">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedPurchase && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl">
            <h3 className="text-lg font-semibold mb-4">Select Detail Entry</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse bg-white shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th>#</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Supplier</th>
                    <th>Supplier (Urdu)</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchase.details.map((detail, i) => {
                    const supplier = supplierDetails[detail.supplier_id];
                    return (
                      <tr key={i} className="border-t">
                        <td className="px-6 py-4 text-sm">{i + 1}</td>
                        <td className="px-6 py-4 text-sm">{detail.qty}</td>
                        <td className="px-6 py-4 text-sm">{detail.rate}</td>
                        <td className="px-6 py-4 text-sm">{supplier?.name || 'Loading...'}</td>
                        <td className="px-6 py-4 text-sm">{supplier?.name_ur || 'Loading...'}</td>
                        <td className="px-6 py-4 text-sm">{supplier?.address || 'Loading...'}</td>
                        <td className="px-6 py-4 text-sm">{supplier?.contact_person || 'Loading...'}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleEditModal(detail.purchase_id, detail.supplier_id)}
                            className="bg-gray-200 p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
                          >
                            <svg viewBox="0 0 24 24" fill="none" width="25px" height="25px">
                            <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm text-gray-500 bg-gray-300 rounded-lg py-2 px-4 hover:bg-gray-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchase;
