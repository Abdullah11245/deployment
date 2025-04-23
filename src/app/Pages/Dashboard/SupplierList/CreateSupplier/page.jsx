'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast'; // ✅ Toast import
import './Suppliers.css';

function CreateSupplier() {
  const [status, setStatus] = useState("1");
  const [routeNo, setRouteNo] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [partyOptions, setPartyOptions] = useState([]);

  const [supplierName, setSupplierName] = useState('');
  const [supplierNameUrdu, setSupplierNameUrdu] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [supplierCode, setSupplierCode] = useState('');

  const [loading, setLoading] = useState(false); // ✅ Loading state for form submission

  useEffect(() => {
    setIsClient(true);
  
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/routes/getAll');
        const data = response.data;
  
        if (data?.routes) {
          const routeOptions = data.routes
            .filter(route => route.status === "1" || route.status === 1)
            .map(route => ({
              value: route.id,
              label: route.name,
            }));
          setPartyOptions(routeOptions);
        } else {
          toast.error('No routes found');
        }
      } catch (error) {
        toast.error('Error fetching routes');
      }
    };
  
    fetchRoutes();
  }, []);
  

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleRouteNoChange = (selectedOption) => {
    setRouteNo(selectedOption);
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
      const response = await axios.post(
        'https://accounts-management.onrender.com/common/suppliers/create',
        payload
      );

      if (response.data?.message === 'Supplier created successfully') {
        toast.success('Supplier created successfully');

        // Reset fields
        setSupplierName('');
        setSupplierNameUrdu('');
        setAddress('');
        setContactPerson('');
        setContact('');
        setEmail('');
        setSupplierCode('');
        setRouteNo([]);
        setStatus('1');
      } else {
        toast.error('Failed to create supplier');
      }
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
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
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Create New Supplier</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            {/* Supplier Name */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Supplier Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Supplier Name"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            {/* Supplier Name in Urdu */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Supplier Name in Urdu
              </label>
              <input
                type="text"
                name="name_ur"
                id="name_ur"
                value={supplierNameUrdu}
                onChange={(e) => setSupplierNameUrdu(e.target.value)}
                placeholder="Supplier Name in Urdu"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                required
              />
            </div>

            {/* Address and Contact Person */}
            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Supplier Address"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_person"
                  id="contact_person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Contact Person"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>

            {/* Contact Number and Email */}
            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contact"
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact Number"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>

            {/* Supplier Code and Route Number */}
            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Supplier Code
                </label>
                <input
                  type="text"
                  name="supplier_code"
                  id="supplier_code"
                  value={supplierCode}
                  onChange={(e) => setSupplierCode(e.target.value)}
                  placeholder="Supplier Code"
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Route Number
                </label>
                <Select
                  options={partyOptions}
                  value={routeNo}
                  onChange={handleRouteNoChange}
                  className="mt-2"
                  placeholder="Select Route"
                />
              </div>
            </div>

            {/* Status Selection */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Status
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    id="active"
                    value="1"
                    checked={status === "1"}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label htmlFor="active" className="pl-3 text-base font-medium text-[#07074D]">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    id="inactive"
                    value="0"
                    checked={status === "0"}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label htmlFor="inactive" className="pl-3 text-base font-medium text-[#07074D]">
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button with Loading Spinner */}
            <div className="w-full mt-8">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none disabled:opacity-60"
                disabled={loading}
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

export default CreateSupplier;
