'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import Select from 'react-select'; // For dropdowns
import './Sale.css';
import SupplierTable from './table';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import end_points from '../../../../../../../api_url';

function CreatePurchase() {
  const [purchaseDate, setPurchaseDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [routeId, setRouteId] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [note, setNote] = useState('');
  const [routes, setRoutes] = useState([]);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('1');
  const [isClient, setIsClient] = useState(false); 
  const [suppliers, setSuppliers] = useState([]); 
  const [supplierInputs, setSupplierInputs] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [hasSuppliers, setHasSuppliers] = useState(false); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null); 

  const { id: purchaseId,main_id } = useParams();


  useEffect(() => {
    setIsClient(true); 
    const fetchRoutesAndItems = async () => {
      try {
        const [routeResponse, itemResponse] = await Promise.all([
          axios.get(`${end_points}/routes/getAll`),
          axios.get(`${end_points}/items/getAll`),
        ]);
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
        setLoading(false); 
      } catch (error) {
        setLoading(false); 
        console.error('Error fetching routes or items:', error);
      }
    };
    
    fetchRoutesAndItems();
  }, []);
  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const response = await axios.get(`${end_points}/purchase/purchases/${purchaseId}`);
        const data = response.data;
        setPurchaseData(data); 
  
        setPurchaseDate(data.purchase_date?.split('T')[0]);
        setEndDate(data.end_date?.split('T')[0]);
        setNameUr(data.name_ur);
        setNote(data.note);
        setStatus(data.status ? '1' : '0');
  
        await fetchSuppliers(data.route_id);
  
        // Fetch supplier details
        const fetchSupplierInputs = async () => {
          if (purchaseData && suppliers.length > 0 && supplierInputs.length === 0) {
            try {
              const inputs = await Promise.all(
                suppliers.map(async (supplier) => {
                  const detail = await axios.get(
                    `${end_points}/purchaseDetail/${purchaseId}/${supplier.id}`,
                    {headers: {
                      'Access-Control-Allow-Origin': '*'
                    }}
                  );
                  return {
                    qty_mann: detail.data.qty,
                    rate: detail.data.rate,
                    supplier_code: supplier.supplier_code,
                  };
                })
              );
              setSupplierInputs(inputs);
            } catch (error) {
              console.error("Error fetching supplier inputs:", error);
            }
          }
        };
        fetchSupplierInputs();

      } catch (err) {
        console.error("Failed to fetch purchase:", err);
      }
    };
    if (purchaseId) fetchPurchaseData();
  }, [purchaseId,suppliers]);
  useEffect(() => {
    if (purchaseData && items.length > 0 && routes.length > 0) {
      const matchedItem = items.find(i => i.value === purchaseData.item_id);
      const matchedRoute = routes.find(r => r.value === purchaseData.route_id);
  
      setSelectedItem(matchedItem || null);
      setRouteId(matchedRoute || null);
    }
  }, [purchaseData, items, routes]);
  
  
  
  const handleRouteChange = async (selectedOption) => {
    setRouteId(selectedOption);
    await fetchSuppliers(selectedOption?.value); // Fetch suppliers for the selected route
  };

  const fetchSuppliers = async (selectedRouteId) => {
    try {
      const response = await axios.get(`${end_points}/suppliers/getAll`);
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
    e.preventDefault();
    setLoading(true);
  
    const purchasePayload = {
      purchase_date: purchaseDate,
      end_date: endDate,
      name_ur: nameUr,
      route_id: routeId?.value,
      item_id: selectedItem.value,
      note: note,
      status: status === '1' ? 1 : 0,
    };
  
    try {
      // 1. Update Purchase
      await axios.put(`${end_points}/purchase/purchases/${purchaseId}`, purchasePayload);
  
      // 2. Update Purchase Details
      await Promise.all(supplierInputs.map((input, index) => {
        const supplierId = suppliers[index]?.id;
        return axios.put(
          `${end_points}/purchaseDetail/${purchaseId}/${supplierId}`,
          {
            qty: parseFloat(input.qty_mann || 0),
            rate: parseFloat(input.rate || 0),
          }
        );
      }));
  
      const voucherMain = await axios.get(`${end_points}/voucher/${main_id}`)
      ;
      const voucherId = voucherMain?.data?.id;

         console.log(voucherId)
      await axios.put(`${end_points}/voucher/${voucherId}`, {
        voucher_id: purchaseId,
        voucher_type: 'PV',
        voucher_date: purchaseDate,
        note: note,
      });
  
      const totalCredit = supplierInputs.reduce((acc, input) => {
        return acc + (parseFloat(input.qty_mann || 0) * parseFloat(input.rate || 0));
      }, 0);
  
  
const allVoucherDetails = supplierInputs.map((input, index) => {
  const supplier = suppliers[index];
  const creditAmount = parseFloat(input.qty_mann || 0) * parseFloat(input.rate || 0);
  const hasValidData = input.qty_mann && input.rate;

  const formattedParticulars = hasValidData
    ? `${selectedItem.label}: ${input.qty_mann}@${input.rate}/- (${purchaseDate ? new Date(purchaseDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : 'N/A'})`
    : '';

  return {
    index,
    main_id: voucherId,
    account_code: supplier?.supplier_code || "",
    particulars: formattedParticulars,
    debit: 0,
    credit: creditAmount,
    voucher_type: 'PV',
  };
});

const filteredVoucherDetail = allVoucherDetails.filter(
  (item) => item.debit > 0 || item.credit > 0
);

for (const detail of filteredVoucherDetail) {
  const { voucher_type, index, main_id: voucher_id } = detail;
  const { index: _index, ...rest } = detail;


  try {
    const res = await axios.put(
      `${end_points}/voucherDetail/update/${voucher_type}/${purchaseId}/${index}`,
      rest
    );
  } catch (error) {
    console.error('Error updating entry:', detail);
    console.error(error.response?.data || error.message);
  }
}


const debitEntry = {
  main_id: Number(purchaseId),
  account_code: "1140001",
  particulars: `Purchase of ${selectedItem.label}`,
  debit: totalCredit,
  credit: 0,
};

try {
  const voucher_type='PV'
  const debitRes = await axios.put(
    `${end_points}/voucherDetail/update/${voucher_type}/${purchaseId}/${allVoucherDetails.length}`,
    debitEntry
  );
  console.log('Debit entry update response:', debitRes.data);
} catch (error) {
  console.error('Error updating debit entry:', error.response?.data || error.message);
}

 

      toast.success("Purchase and Vouchers updated successfully!");
      setLoading(false);
    } catch (err) {
      let errorMessage = "Update failed";
    
      if (err.response && err.response.data && err.response.data.message) {
        // Server responded with an error message
        errorMessage = `Update failed: ${err.response.data.message}`;
      } else if (err.message) {
        // General JS error message
        errorMessage = `Update failed: ${err.message}`;
      }
    
      toast.error(errorMessage);
      setLoading(false);
      console.error("Error during update:", err);
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
            <Toaster position="top-right" reverseOrder={false} />

      <div className="flex items-center justify-center p-12 text-black">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4 mb-5">
              <div className="w-1/2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  id="purchase_date"
                  value={purchaseDate || ''}
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
                  value={endDate || ''}
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
  value={selectedItem}
  onChange={(selectedOption) => setSelectedItem(selectedOption)}
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
