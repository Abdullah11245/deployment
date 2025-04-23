'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import Select from 'react-select'; // For dropdowns
import './Purchase.css';
import SupplierTable from './Suppliertable';
import toast, { Toaster } from 'react-hot-toast';

function CreatePurchase() {
  const [purchaseDate, setPurchaseDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [routeId, setRouteId] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [note, setNote] = useState('');
  const [routes, setRoutes] = useState([]);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('1'); // Default status as "Active"
  const [isClient, setIsClient] = useState(false); // Flag to check if the component is rendered on the client
  const [suppliers, setSuppliers] = useState([]); // New state to store filtered suppliers
  const [supplierInputs, setSupplierInputs] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loading state
  const [hasSuppliers, setHasSuppliers] = useState(false); // New state to check if suppliers exist
  
  useEffect(() => {
    setIsClient(true); // Set to true once the component is mounted on the client
    
    // Fetch available routes and items from the API
    const fetchRoutesAndItems = async () => {
      try {
        const [routeResponse, itemResponse] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/routes/getAll'),
          axios.get('https://accounts-management.onrender.com/common/items/getAll'),
        ]);
    
        // Filter routes based on status being '1' (active)
        const filteredRoutes = routeResponse?.data?.routes.filter(route => route.status === '1') || [];
    
        setRoutes(
          filteredRoutes.map(route => ({
            value: route.id,
            label: route.name,
          }))
        );
    
        setItems(
          itemResponse?.data?.map(item => ({
            value: item.id,
            label: item.name,
          })) || []
        );
        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        setLoading(false); // Set loading to false even if there's an error
        console.error('Error fetching routes or items:', error);
      }
    };
    
    fetchRoutesAndItems();
  }, []);

  const handleRouteChange = async (selectedOption) => {
    setRouteId(selectedOption);
    await fetchSuppliers(selectedOption?.value); // Fetch suppliers for the selected route
  };

  const fetchSuppliers = async (selectedRouteId) => {
    try {
      const response = await axios.get('https://accounts-management.onrender.com/common/suppliers/getAll');
      const allSuppliers = response?.data?.suppliers || [];
  
      const filteredSuppliers = allSuppliers?.filter(supplier => 
        supplier?.route?.id === selectedRouteId
      );
  
      setSuppliers(filteredSuppliers);
      setHasSuppliers(filteredSuppliers.length > 0); // Check if suppliers exist for the selected route
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleQuantityChange = (index, value) => {
    // Round the value if it's fractional (i.e., contains a decimal)
    const roundedValue = Math.round(parseFloat(value));  // Rounds to the nearest integer

    // Update the supplierInputs with the rounded value
    const newSupplierInputs = [...supplierInputs];
    newSupplierInputs[index].qty_mann = roundedValue;
    setSupplierInputs(newSupplierInputs);
  };

  const handleSubmit = async (e) => {
    setLoading(true); // Set loading to true when the form is submitted
    e.preventDefault();
  
    const payload = {
      purchase_date: purchaseDate,
      end_date: endDate,
      name_ur: nameUr,
      route_id: routeId?.value,
      item_id: itemId?.value,
      note: note,
      status: status === '1' ? 1 : 0,
    };
  
    try {
      const response = await axios.post('https://accounts-management.onrender.com/common/purchase/create', payload);
  
      if (response.data?.message === 'Purchase created successfully') {
        const purchaseId = response.data?.result?.insertId || response.data?.id; // Adjust based on response structure         
        const purchaseDetailRequests = supplierInputs.map((input, index) => {
          const detailPayload = {
            purchase_id: purchaseId,
            supplier_id: suppliers[index]?.id,  // Make sure suppliers and supplierInputs align
            qty: parseFloat(input.qty_mann || 0),
            rate: parseFloat(input.rate || 0),
          };
          return axios.post('https://accounts-management.onrender.com/common/purchaseDetail/create', detailPayload);
        });
  
        await Promise.all(purchaseDetailRequests);
  
        // Reset form after submission
        setPurchaseDate('');
        setEndDate('');
        setNameUr('');
        setRouteId(null);
        setItemId(null);
        setNote('');
        setStatus('1');
        setSupplierInputs([]);
        setLoading(false);
        toast.success('Purchase created successfully!');
      } else {
        setLoading(false); // Set loading to false if there's an error
        toast.error('Failed to create purchase');
      }
    } catch (error) {
      setLoading(false); // Set loading to false if there's an error
      toast.error('Error while submitting the form');
    }
  };

  if (!isClient) {
    return null; 
  }

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
        <h2 className="text-xl font-semibold text-gray-700">Create New Purchase</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            {/* Purchase Date and End Date */}
            <div className="flex space-x-4 mb-5">
              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Purchase Date</label>
                <input
                  type="datetime-local"
                  name="purchase_date"
                  id="purchase_date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  placeholder="Purchase Date"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">End Date</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  id="end_date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Name in Urdu and Route */}
            <div className="flex space-x-4 mb-5">
              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Name in Urdu</label>
                <input
                  type="text"
                  name="name_ur"
                  id="name_ur"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  placeholder="Name in Urdu"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  required
                />
              </div>

              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Route</label>
                <Select
                  options={routes}
                  value={routeId}
                  onChange={handleRouteChange}
                  placeholder="Select Route"
                  className="w-full rounded-md"
                />
              </div>
            </div>

            {/* Item and Note */}
            <div className="flex space-x-4 mb-5">
              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Item</label>
                <Select
                  options={items}
                  value={itemId}
                  onChange={setItemId}
                  placeholder="Select Item"
                  className="w-full rounded-md"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Status</label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    id="active"
                    value="1"
                    checked={status === "1"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="active" className="pl-3 text-base font-medium text-[#07074D]">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    id="inactive"
                    value="0"
                    checked={status === "0"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="inactive" className="pl-3 text-base font-medium text-[#07074D]">Inactive</label>
                </div>
              </div>
            </div>

            <SupplierTable 
             supplier={suppliers}
             supplierInputs={supplierInputs}
             setSupplierInputs={setSupplierInputs}
             handleQuantityChange={handleQuantityChange} // Pass handleQuantityChange to SupplierTable
            />

            <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Note</label>
                <textarea
                  name="note"
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

            <div className="w-full mt-8">
              <button 
                type="submit" 
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none"
                disabled={!hasSuppliers} // Disable button if no suppliers for selected route
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePurchase;
