'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function EditItem() {
  const { id } = useParams(); 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('1');
  const [type, setType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true); 
      try {
        const response = await axios.get(`https://accounts-management.onrender.com/common/items/items/${id}`);
        const data = response.data;

        setName(data.name || '');
        setDescription(data.description || '');
        setStatus(data.status === 1 ? '1' : '0');
        setType(data.type || '');
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item data.');
      } finally {
        setIsLoading(false); 
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      status: status === '1' ? 1 : 0,
      type: type || null,
    };

    setIsSubmitting(true);

    try {
      const response = await axios.put(`https://accounts-management.onrender.com/common/items/items/${id}`, payload);

      if (response.data?.message === 'Item updated successfully') {
        toast.success('Item updated successfully');
      } else {
        toast.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
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
        <h2 className="text-xl font-semibold text-gray-700">Edit Item</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Item Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Status</label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="1"
                    checked={status === '1'}
                    onChange={() => setStatus('1')}
                    className="h-5 w-5"
                  />
                  <label className="pl-3 text-base font-medium text-[#07074D]">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="0"
                    checked={status === '0'}
                    onChange={() => setStatus('0')}
                    className="h-5 w-5"
                  />
                  <label className="pl-3 text-base font-medium text-[#07074D]">Inactive</label>
                </div>
              </div>
            </div>

            <div className="mb-5">
  <label className="mb-3 block text-base font-medium text-[#07074D]">Item Type</label>
  <select
    value={type}
    onChange={(e) => setType(e.target.value)}
    className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
    required
  >
    <option value="" disabled>Select Type</option>
    <option value="Sale">Sale</option>
    <option value="Purchase">Purchase</option>
  </select>
</div>


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

export default EditItem;
