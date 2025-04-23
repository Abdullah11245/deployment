'use client';
import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';


function CreateItem() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('1');
  const [type, setType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: name,
      description: description,
      status: status === '1' ? 1 : 0,
      type: type || null,
    };

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'https://accounts-management.onrender.com/common/items/create',
        payload
      );
      console.log(response.data);

      if (response.data?.message === 'Item created successfully') {
        toast.success('Item created successfully!'); // Show success toast
        setName('');
        setDescription('');
        setStatus('1');
        setType('');
      } else {
        toast.error('Failed to create item'); // Show error toast
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error while submitting the form'); // Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };
  if ( isSubmitting ) return <div className="flex justify-center items-center h-screen bg-white">
  <div className="flex space-x-2">
  <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
<span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
<span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
<span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
  </div>
</div>;
  return (
    <div className="container mx-auto px-4 py-8">
            <Toaster position="top-right" reverseOrder={false} />  
      
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Create New Item</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            {/* Item Name */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item Name"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                required
              />
            </div>

            {/* Item Description */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Item Description
              </label>
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Item Description"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                required
              />
            </div>

            {/* Item Status */}
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
                    checked={status === '1'}
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
                    checked={status === '0'}
                    onChange={handleStatusChange}
                    className="h-5 w-5"
                  />
                  <label htmlFor="inactive" className="pl-3 text-base font-medium text-[#07074D]">
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            {/* Item Type (Optional) */}
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Item Type
              </label>
              <input
                type="text"
                name="type"
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Item Type (Optional)"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none"
              >
                { 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateItem;
