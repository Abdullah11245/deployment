'use client';
import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../../api_url';

function CreateRoute() {
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState('Y');
  const [purchaseFile, setPurchaseFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post(
        `${end_points}/auth/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.data) {
        toast.success('File uploaded successfully');
        return response.data.data;
      } else {
        toast.error('Failed to upload file');
        return null;
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Error uploading file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPurchaseFile(file);
      console.log("Selected File:", file);
      const uploadedUrl = await uploadFile(file);
      setUploadedFileUrl(uploadedUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (purchaseFile && !uploadedFileUrl) {
      toast.error('Please wait for the file to finish uploading');
      setLoading(false);
      return;
    }

    const payload = {
      purchase_month: selectedDate,
      process:status,
      purchase_data: uploadedFileUrl || null,
    };

    try {
      const response = await axios.post(
        `${end_points}/monthlyPurchase/create`,
        payload
      );
  console.log(payload)
  console.log(response.data)
      if (response.data?.message === 'Monthly purchase created') {
        toast.success('Monthly purchase created!');
        setSelectedDate('');
        setStatus('Y');
        setPurchaseFile(null);
        setUploadedFileUrl(null);
      } else {
        toast.error('Monthly purchase created');
      }
    } catch (error) {
      console.error('Monthly purchase created:', error);
      toast.error('Error while submitting the form');
    } finally {
      setLoading(false);
    }
  };

  // Loading Animation
  if (loading || uploading) {
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
        <h2 className="text-xl font-semibold text-gray-700">Create New Route</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            {/* Date Selector */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Select Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            {/* Status Selector */}
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
                    value="Y"
                    checked={status === 'Y'}
                    onChange={(e) => setStatus(e.target.value)}
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
                    checked={status === 'N'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="inactive" className="pl-3 text-base font-medium text-[#07074D]">
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Purchase Data (CSV)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full mt-8">
              <button
                type="submit"
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none"
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

export default CreateRoute;
