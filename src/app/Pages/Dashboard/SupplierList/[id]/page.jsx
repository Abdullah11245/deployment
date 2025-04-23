'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import './Suppliers.css';

function CreateSupplier() {
  const { id: supplierId } = useParams();

  const [status, setStatus] = useState("1");
  const [routeNo, setRouteNo] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false); // For both fetching and submitting
  const [partyOptions, setPartyOptions] = useState([]);

  const [supplierName, setSupplierName] = useState('');
  const [supplierNameUrdu, setSupplierNameUrdu] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [supplierCode, setSupplierCode] = useState('');

  useEffect(() => {
    setIsClient(true);

    if (supplierId) {
      fetchSupplierDetails(supplierId);
      fetchRoutes();
    }
  }, [supplierId]);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('https://accounts-management.onrender.com/common/routes/getAll');
      const options = res.data.routes
        .filter(route => route.status === "1" || route.status === 1) // ✅ Filter active routes
        .map(route => ({
          value: route.id,
          label: route.name,
        }));
      setPartyOptions(options);
    } catch (err) {
      toast.error('Error fetching routes');
    }
  };
  

  const fetchSupplierDetails = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://accounts-management.onrender.com/common/suppliers/suppliers/${id}`);
      const data = res.data.supplier;
      console.log('Supplier Data:', data);

      setSupplierName(data.name || '');
      setSupplierNameUrdu(data.name_ur || '');
      setAddress(data.address || '');
      setContactPerson(data.contact_person || '');
      setContact(data.contact || '');
      setEmail(data.email || '');
      setSupplierCode(data.supplier_code || '');
      setStatus(data.status === 1 ? '1' : '0');

      if (data.route_no) {
        setRouteNo({
          value: data.route_no,
          label: data.route_name || `Route ${data.route_no}`,
        });
      }
    } catch (err) {
      toast.error('Error loading supplier details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: supplierName,
      name_ur: supplierNameUrdu,
      address,
      contact_person: contactPerson,
      contact,
      email,
      supplier_code: supplierCode,
      route_no: routeNo?.value,
      status: status === "1" ? 1 : 0,
    };

    try {
      const res = await axios.put(
        `https://accounts-management.onrender.com/common/suppliers/suppliers/${supplierId}`,
        payload
      );

      if (res.data?.message?.includes('successfully')) {
        toast.success('Supplier updated successfully');
      } else {
        toast.error('Update failed');
      }
    } catch (error) {
      toast.error('Error while updating supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleRouteNoChange = (selectedOption) => setRouteNo(selectedOption);

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
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Edit Supplier</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            {/* Supplier Name */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Supplier Name"
                className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
              />
            </div>

            {/* Urdu Name */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Supplier Name in Urdu</label>
              <input
                type="text"
                value={supplierNameUrdu}
                onChange={(e) => setSupplierNameUrdu(e.target.value)}
                placeholder="Supplier Name in Urdu"
                className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
                required
              />
            </div>

            {/* Address & Contact Person */}
            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Supplier Address"
                  className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
                />
              </div>
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Contact Person"
                  className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
                />
              </div>
            </div>

            {/* Contact & Email */}
            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Contact Number</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact Number"
                  className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
                />
              </div>
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
                />
              </div>
            </div>

            {/* Supplier Code & Route Number */}
            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Supplier Code</label>
                <input
                  type="text"
                  value={supplierCode}
                  onChange={(e) => setSupplierCode(e.target.value)}
                  placeholder="Supplier Code"
                  className="w-full rounded-md border py-3 px-6 text-base text-[#6B7280]"
                />
              </div>
              <div className="w-full">
                <label className="block text-base font-medium text-[#07074D]">Route Number</label>
                <Select
                  options={partyOptions}
                  value={routeNo}
                  onChange={handleRouteNoChange}
                  className="mt-3"
                  placeholder="Select Route"
                  isDisabled={true} // 👈 this disables the select input

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
                    value="1"
                    checked={status === "1"}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label className="pl-3 text-base font-medium text-[#07074D]">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="0"
                    checked={status === "0"}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label className="pl-3 text-base font-medium text-[#07074D]">Inactive</label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="w-full mt-8">
              <button
                type="submit"
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-white font-semibold"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSupplier;
