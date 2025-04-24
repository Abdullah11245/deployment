'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function EditRoute() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [submitting, setSubmitting] = useState(false); // For update action
  const [error, setError] = useState('');
  const { id } = useParams();

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://accounts-management.onrender.com/common/routes/routes/${id}`);
        const { name, status } = res.data.route;
        setName(name);
        setStatus(String(status));
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = { name, status };

    try {
      const res = await axios.put(`https://accounts-management.onrender.com/common/routes/routes/${id}`, payload);
      console.log(res.data.message)
      if (res.data && res.data.message === 'Route updated successfully') {
        toast.success('Route updated successfully!'); // Show success toast
      } else {
        toast.error('Failed to update route'); // Show error toast
      }
    } catch (err) {
      console.error('Error updating route:', err);
      toast.error('Something went wrong while updating'); // Show error toast
    } finally {
      setSubmitting(false);
    }
  };

  // 🔄 Loading animation (used for both loading and submitting)
  if (loading || submitting) {
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

  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
              <Toaster position="top-right" reverseOrder={false} />

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Edit Route</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Route Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Route Name"
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                required
              />
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
                    id="active"
                    value="A"
                    checked={status === 'A'}
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
                    value="I"
                    checked={status === 'I'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-5 w-5"
                  />
                  <label htmlFor="inactive" className="pl-3 text-base font-medium text-[#07074D]">
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            <div className="w-full mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none"
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

export default EditRoute;
