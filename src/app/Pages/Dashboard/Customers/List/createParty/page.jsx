'use client';
import end_points from '../../../../../api_url';
import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function CreateParty() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_person: '',
    contact: '',
    email: '',
    status: '1',
  });

  const [loading, setLoading] = useState(false); // 🔄 Loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      status: formData.status === '1' ? 1 : 0,
    };

    try {
      const response = await axios.post(
        `${end_points}/parties/create`,
        payload
      );

      if (response.data?.message === 'Party created successfully') {
        toast.success('Party created successfully!');
        setFormData({
          name: '',
          address: '',
          contact_person: '',
          contact: '',
          email: '',
          status: '1',
        });
      } else {
        toast.error('Failed to create party');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Loading Spinner View
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
      <Toaster position="top-right" /> {/* ✅ Toast Container */}

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Create New Party</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-500 focus:shadow-md"
              />
            </div>

            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Contact Person"
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-500 focus:shadow-md"
                />
              </div>

              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Contact"
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-500 focus:shadow-md"
                />
              </div>
            </div>

            <div className="flex space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-500 focus:shadow-md"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Status
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="1"
                    checked={formData.status === '1'}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label className="pl-3 text-base font-medium text-[#07074D]">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="0"
                    checked={formData.status === '0'}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label className="pl-3 text-base font-medium text-[#07074D]">Inactive</label>
                </div>
              </div>
            </div>

            <div className="w-full mt-8">
              <button
                type="submit"
                className="hover:shadow-form rounded-md bg-blue-600 w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none"
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

export default CreateParty;
