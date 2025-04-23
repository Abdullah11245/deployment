'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Purchase.css';
import SupplierTable from './Suppliertable';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function EditPurchase() {
  const { id: purchaseId, supplier_id } = useParams();
  const [loading, setLoading] = useState(true); // ✅ Loading state

  const [purchaseDate, setPurchaseDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [routeId, setRouteId] = useState(null); // This will hold the selected route
  const [itemId, setItemId] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('1');
  const [routes, setRoutes] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierInputs, setSupplierInputs] = useState([]); // Contains the details for qty and rate
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchRoutesAndItems = async () => {
      try {
        const [routeRes, itemRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/routes/getAll'),
          axios.get('https://accounts-management.onrender.com/common/items/getAll'),
        ]);

        const routeOptions = routeRes?.data?.routes?.map(route => ({
          value: route.id,
          label: route.name
        })) || [];

        const itemOptions = itemRes?.data?.map(item => ({
          value: item.id,
          label: item.name
        })) || [];

        setRoutes(routeOptions);
        setItems(itemOptions);
      } catch (err) {
        console.error('Error loading routes/items:', err);
      }
    };

    fetchRoutesAndItems();
  }, []);

  useEffect(() => {
    if (purchaseId && routes.length > 0 && items.length > 0) {
      const fetchPurchase = async () => {
        try {
          const res = await axios.get(`https://accounts-management.onrender.com/common/purchase/purchases/${purchaseId}`);
          const purchase = res.data;
          console.log('Purchase:', purchase);

          setPurchaseDate(formatDate(purchase.purchase_date) || ''); // Use helper to format
          setEndDate(formatDate(purchase.end_date) || ''); // Use helper to format
          setNameUr(purchase.name_ur || '');
          setNote(purchase.note || '');
          setStatus(purchase.status?.toString() || '1');

          const matchedRoute = routes.find(route => route.value === purchase.route_id);
          const matchedItem = items.find(item => item.value === purchase.item_id);
          setRouteId(matchedRoute); // Set the route from the response
          setItemId(matchedItem);

          fetchSuppliers(purchase.route_id);

          if (supplier_id) {
            const detailRes = await axios.get(
              `https://accounts-management.onrender.com/common/purchaseDetail/${purchaseId}/${supplier_id}`
            );

            const detail = detailRes.data;
            console.log('Purchase Detail:', detail);

            setSupplierInputs([{
              supplier_id: detail.supplier_id,
              qty_mann: detail.qty,
              rate: detail.rate
            }]);
            setLoading(false)
          }
        } catch (err) {
          setLoading(false)

          console.error('Error fetching purchase:', err);
        }
      };

      fetchPurchase();
    }
  }, [purchaseId, supplier_id, routes, items]);

  const fetchSuppliers = async (selectedRouteId) => {
    try {
      const res = await axios.get('https://accounts-management.onrender.com/common/suppliers/getAll');
      let allSuppliers = res.data?.suppliers || [];

      let filtered = allSuppliers.filter(s => s?.route?.id === selectedRouteId);

      if (supplier_id) {
        filtered = filtered.filter(s => s.id?.toString() === supplier_id.toString());
      }

      setSuppliers(filtered);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  const handleRouteChange = (selectedOption) => {
    console.log('Route change attempt blocked');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   setLoading(true)
    const payload = {
      purchase_date: purchaseDate,
      end_date: endDate,
      name_ur: nameUr,
      route_id: routeId?.value,
      item_id: itemId?.value,
      note,
      status: status === '1' ? 1 : 0,
    };

    try {
      await axios.put(
        `https://accounts-management.onrender.com/common/purchase/purchases/${purchaseId}`,
        payload
      );

      if (supplierInputs.length && supplier_id) {
        const detailPayload = {
          purchase_id: purchaseId,
          supplier_id: supplier_id,
          qty: parseFloat(supplierInputs[0]?.qty_mann ),
          rate: parseFloat(supplierInputs[0]?.rate ),
        };

        await axios.put(
          `https://accounts-management.onrender.com/common/purchaseDetail/${purchaseId}/${supplier_id}`,
          detailPayload
        );
      }
        setLoading(false)
      toast.success('Purchase and details updated successfully');
     
    } catch (err) {
      console.error('Update failed', err);
      setLoading(false)

      toast.error('Failed to update purchase');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const formattedDate = date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
    return formattedDate;
  };

  if (!isClient) return null;
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
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-6">Edit Purchase</h2>

      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-5">
          <div className="w-1/2">
            <label className="block mb-2 text-sm font-medium text-gray-700">Purchase Date</label>
            <input
              type="datetime-local"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="w-1/2">
            <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Name & Route */}
        <div className="flex space-x-4 mb-5">
          <div className="w-1/2">
            <label className="block mb-2 text-sm font-medium text-gray-700">Name in Urdu</label>
            <input
              type="text"
              value={nameUr}
              onChange={(e) => setNameUr(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="w-1/2">
            <label className="block mb-2 text-sm font-medium text-gray-700">Route</label>
            <Select
              options={routes}
              value={routeId}
              onChange={handleRouteChange}
              isDisabled // Disable route selection
              placeholder="Select Route"
              className="w-full"
            />
          </div>
        </div>

        {/* Item */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">Item</label>
          <Select
            value={itemId}
            onChange={setItemId}
            options={items}
            placeholder="Select Item"
          />
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                value="1"
                checked={status === '1'}
                onChange={() => setStatus('1')}
              /> Active
            </label>
            <label>
              <input
                type="radio"
                value="0"
                checked={status === '0'}
                onChange={() => setStatus('0')}
              /> Inactive
            </label>
          </div>
        </div>

        {/* Supplier Table */}
        <SupplierTable
          supplier={suppliers}
          supplierInputs={supplierInputs}
          setSupplierInputs={setSupplierInputs}
        />

        {/* Note */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Submit */}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded">
          Update Purchase
        </button>
      </form>
    </div>
  );
}

export default EditPurchase;
