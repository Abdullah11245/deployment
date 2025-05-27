'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../api_url';

function EditBank() {
  const { id } = useParams(); // Get bank id from the route
  const [status, setStatus] = useState("1");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Submitting state
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [address, setAddress] = useState('');
  const [accountCode, setAccountCode] = useState('');

  useEffect(() => {
    setIsClient(true);
    fetchBank();
  }, [id]);

  const fetchBank = async () => {
    try {
      const response = await axios.get(`${end_points}/banks/banks/${id}`);
      const data = response.data;
   
      setAccountTitle(data.account_title || '');
      setAccountNumber(data.account_number || '');
      setAddress(data.address || '');
      setAccountCode(data.account_code || '');
      setStatus(data.status === 1 ? "1" : "0");
    } catch (error) {
      console.error('Error fetching bank data:', error);
      toast.error('🚨 Failed to load bank data.');
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      account_title: accountTitle,
      account_number: accountNumber,
      address,
      account_code: accountCode,
      status: status === "1" ? 1 : 0,
    };

    setIsSubmitting(true); // Start submitting state
    try {
      const response = await axios.put(`${end_points}/banks/banks/${id}`, payload);
      if (response.data?.message === 'Bank updated successfully') {
        toast.success(' Bank updated successfully');
      } else {
        toast.error(' Failed to update bank');
      }
    } catch (error) {
      console.error('Error updating bank:', error);
      toast.error('🚨 Error while updating the bank');
    } finally {
      setIsSubmitting(false); // End submitting state
    }
  };

  if (!isClient || isLoading || isSubmitting) return <div className="flex justify-center items-center h-screen bg-white">
  <div className="flex space-x-2">
  <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
<span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
<span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
<span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
  </div>
</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />  

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Edit Bank</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex flex-wrap -mx-2">
              <div className="w-full md:w-1/2 px-2 mb-5 md:mb-0">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Account Title</label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="Account Title"
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
                  required
                />
              </div>

              <div className="w-full md:w-1/2 px-2">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
                  required
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
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
                required
              />
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Account Code</label>
              <input
                type="text"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="Account Code"
                disabled
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

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

            {/* Submit Button */}
            <div className="w-full mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="hover:shadow-form rounded-md bg-blue-600 w-1/2 py-3 px-8 text-center text-base font-semibold text-white"
              >
                { 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBank;
