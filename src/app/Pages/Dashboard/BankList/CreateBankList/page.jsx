'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../api_url';


function CreateBank() {
  const [status, setStatus] = useState("1");
  const [isClient, setIsClient] = useState(false);
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [address, setAddress] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [loading, setLoading] = useState(false); // 🔄 Loader state

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleStatusChange = (e) => setStatus(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🌀 Show loader

    const payload = {
      account_title: accountTitle,
      account_number: accountNumber,
      address: address,
      account_code: accountCode,
      status: status === "1" ? 1 : 0,
    };

    try {
      const response = await axios.post(
        `${end_points}/banks/create`,
        payload
      );

      if (response.data?.message === 'Bank created successfully') {
        toast.success('✅ Bank created successfully');
        // Reset form
        setAccountTitle('');
        setAccountNumber('');
        setAddress('');
        setAccountCode('');
        setStatus('1');
      } else {
        toast.error('⚠️ Failed to create bank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('🚨 Error while submitting the form');
    } finally {
      setLoading(false); // 🧊 Hide loader
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
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
        <h2 className="text-xl font-semibold text-gray-700">Create New Bank</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            {/* Fields */}
            <div className="mb-5 flex flex-wrap -mx-2">
              <div className="w-full md:w-1/2 px-2 mb-5 md:mb-0">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Account Title</label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="Account Title"
                  required
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="w-full md:w-1/2 px-2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  required
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bank Address"
                required
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Account Code</label>
              <input
                type="text"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="Account Code"
                required
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            {/* Status */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Status</label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="1"
                    checked={status === "1"}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <span className="pl-3 text-base font-medium text-[#07074D]">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="0"
                    checked={status === "0"}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <span className="pl-3 text-base font-medium text-[#07074D]">Inactive</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full mt-8">
              <button
                type="submit"
                disabled={loading}
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none flex justify-center items-center gap-2"
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

export default CreateBank;
