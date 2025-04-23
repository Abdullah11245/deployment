'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sale.css';

const CreateDiaryVoucher = () => {
  const [formData, setFormData] = useState({
    issue_date: '',
    cheque_date: '',
    cheque_no: '',
    cheque_amount: '',
    bank_code: '',
    supplier_code: '',
    particulars: '',
    notes: '',
    dv_status: 'A',
  });

  const [banks, setBanks] = useState([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get('https://accounts-management.onrender.com/common/banks/getAll');
        setBanks(res.data || []);
      } catch (err) {
        console.error('Failed to fetch banks:', err);
      }
    };

    fetchBanks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'https://accounts-management.onrender.com/common/diaryVoucher/create',
        formData
      );
   console.log(res.data);
      if (res?.data) {
        alert('Diary Voucher created successfully!');
        setFormData({
          issue_date: '',
          cheque_date: '',
          cheque_no: '',
          cheque_amount: '',
          bank_code: '',
          supplier_code: '',
          particulars: '',
          notes: '',
          dv_status: 'A',
        });
      } else {
        throw new Error('Failed to create diary voucher');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the diary voucher.');
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Create Diary Voucher</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Issue Date</label>
            <input
              type="datetime-local"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cheque Date</label>
            <input
              type="datetime-local"
              name="cheque_date"
              value={formData.cheque_date}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
            <input
              type="text"
              name="cheque_no"
              value={formData.cheque_no}
              onChange={handleChange}
              maxLength="16"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cheque Amount</label>
            <input
              type="number"
              name="cheque_amount"
              value={formData.cheque_amount}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-600 mb-1">Bank Code</label>
  <select
    name="bank_code"
    value={formData.bank_code}
    onChange={handleChange}
    className="cst_inpt w-full border border-gray-300 px-4 py-2 rounded-md"
    required
  >
    <option value="">Select Bank</option>
    {banks?.map((bank) => (
      <option key={bank.id} value={bank?.account_code}>
        {bank?.account_title}
      </option>
    ))}
  </select>
</div>


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Supplier Code</label>
            <input
              type="text"
              name="supplier_code"
              value={formData.supplier_code}
              onChange={handleChange}
              maxLength="7"
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Particulars + Status side-by-side */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Particulars</label>
            <input
              type="text"
              name="particulars"
              value={formData.particulars}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              name="dv_status"
              value={formData.dv_status}
              onChange={handleChange}
              className="cst_inpt w-full border border-gray-300 px-4 py-2 rounded-md"
            >
              <option value="A">Active</option>
              <option value="P">Posted</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
        >
          Submit Diary Voucher
        </button>
      </form>
    </div>
  );
};

export default CreateDiaryVoucher;
