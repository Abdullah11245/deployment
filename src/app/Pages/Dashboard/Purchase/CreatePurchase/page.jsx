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
  const [selectedItem, setSelectedItem] = useState({ id: '', label: '' });
  const [purchaseid,setPurchaseId]=useState('')
  useEffect(() => {
    setIsClient(true); // Set to true once the component is mounted on the client
    
    // Fetch available routes and items from the API
    const fetchRoutesAndItems = async () => {
      try {
        const [routeResponse, itemResponse,purchaseRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/routes/getAll'),
          axios.get('https://accounts-management.onrender.com/common/items/getAll'),
          axios.get('https://accounts-management.onrender.com/common/purchase/getAll')
        ]);
        console.log(purchaseRes.data.length)
     setPurchaseId(purchaseRes.data.length)
        const filteredRoutes = routeResponse?.data?.routes.filter(route => route.status === 'A') || [];
        const filteredItems = itemResponse?.data?.filter(item => item.type == 'Purchase') || [];

        setRoutes(
          filteredRoutes.map(route => ({
            value: route.id,
            label: route.name,
          }))
        );
    
        setItems(
          filteredItems?.map(item => ({
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
    setLoading(true);
    e.preventDefault();
  
  
    const purchasePayload = {
      purchase_date: purchaseDate,
      end_date: endDate,
      name_ur: nameUr,
      route_id: routeId?.value,
      item_id: selectedItem.id,
      note: note,
      status: status === '1' ? 1 : 0,
    };
  
    try {
      // 1. Create Purchase
      const purchaseResponse = await axios.post('https://accounts-management.onrender.com/common/purchase/create', purchasePayload);
  
      if (purchaseResponse.data?.message === 'Purchase created successfully') {
        const purchaseId = purchaseResponse.data?.result?.insertId || purchaseResponse.data?.id;
  
        // 2. Create Purchase Details
        const purchaseDetailRequests = supplierInputs.map((input, index) => {
          const detailPayload = {
            purchase_id: purchaseId,
            supplier_id: suppliers[index]?.id,
            qty: parseFloat(input.qty_mann || 0),
            rate: parseFloat(input.rate || 0),
          };
          return axios.post('https://accounts-management.onrender.com/common/purchaseDetail/create', detailPayload);
        });
  
        await Promise.all(purchaseDetailRequests);
  
        const totalCredit = supplierInputs.reduce((acc, input) => {
          return acc + (parseFloat(input.qty_mann || 0) * parseFloat(input.rate || 0));
        }, 0);
  
        const debitVoucherPayload = {
          voucher_id: purchaseId,
          voucher_type: 'PV',
          voucher_date: purchaseDate,
          note: note,
        };
    
        const debitVoucherResponse = await axios.post('https://accounts-management.onrender.com/common/voucher/create', debitVoucherPayload);
        if (debitVoucherResponse.data?.message === 'Voucher created successfully') {
          const voucher = debitVoucherResponse.data?.id;
           console.log('Voucher created successfully:', voucher);
          const allVoucherDetails = supplierInputs.map((input, index) => {
            const supplier = suppliers[index];
            const creditAmount = parseFloat(input.qty_mann || 0) * parseFloat(input.rate || 0);
            const hasValidData = input.qty_mann && input.rate;
            const formattedParticulars = hasValidData
              ? `${selectedItem.label}: ${input.qty_mann}@${input.rate}/- (${purchaseDate ? new Date(purchaseDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : 'N/A'})`
              : '';
        
            return {
              main_id: voucher,
              account_code: supplier?.supplier_code || "",
              particulars: formattedParticulars,
              debit: 0,
              credit: creditAmount,
            };
          });
        
          const responses = [];
        
          // STEP 2: Post all credit entries
          for (const detail of allVoucherDetails) {
            try {
              const res = await axios.post(
                'https://accounts-management.onrender.com/common/voucherDetail/create',
                detail
              );
              responses.push(res.data);
            } catch (error) {
              console.error(error.response?.data || error.message);
              responses.push(null);
            }
          }
        
          const debitEntry = {
            main_id: voucher,
            account_code: "1140001",
            particulars: `Purchase of ${selectedItem.label}`,
            debit: totalCredit,
            credit: 0,
          };
        
          try {
            const debitRes = await axios.post(
              'https://accounts-management.onrender.com/common/voucherDetail/create',
              debitEntry
            );
            setLoading(false);
            console.log('Debit entry response:', debitRes.data);
          } catch (error) {
            setLoading(false);
            console.error('Error posting debit entry:', error.response?.data || error.message);
          }
        }
        else {
          setLoading(false);
          toast.error('Failed to create voucher');
        }
      } else {
        setLoading(false);
        toast.error('Failed to create purchase');
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error while submitting the form');
      console.error(error);
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
<Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-center p-12">
    
        <div className="mx-auto w-full bg-white">
        <div className='mb-6 w-32'>
            <label className="block text-gray-700 font-medium mb-2">Purchase ID</label>
            <input
              type="text"
              value={purchaseid+1}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-not-allowed text-gray-600"
            />
          </div>
          <form onSubmit={handleSubmit}>
            {/* Purchase Date and End Date */}
            <div className="flex space-x-4 mb-5">
              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Purchase Date</label>
                <input
                  type="date"
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
                  type="date"
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
  value={selectedItem?.label ? { label: selectedItem.label, value: selectedItem.id } : null} // Using both id and label
  onChange={(selectedOption) => setSelectedItem({ id: selectedOption?.value, label: selectedOption?.label })}  // Set both id and label
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

            <div className="w-1/2 mt-5">
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
