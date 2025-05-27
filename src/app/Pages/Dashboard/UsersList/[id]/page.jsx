'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../api_url';

const CreateUserForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    avatar: '',
    role: 'admin',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `${end_points}/user/${id}`,
        formData
      );
      if (res?.data) {
        toast.success('User updated successfully!');
        setFormData({
          firstname: '',
          lastname: '',
          username: '',
          email: '',
          password: '',
          avatar: '',
          role: 'admin',
        });
      } else {
        toast.error('Something went wrong.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="relative mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Edit User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep existing"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Avatar URL (optional)</label>
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-3 rounded-md"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
        >
          Update User
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;
