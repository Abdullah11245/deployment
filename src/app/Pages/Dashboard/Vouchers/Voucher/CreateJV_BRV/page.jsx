'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './JV_BRVtable';
import Select from 'react-select';
import './Sale.css';
import toast, { Toaster } from 'react-hot-toast';

const voucherTypeOptions = [
  { value: 'JV', label: 'JV' },
  { value: 'BRV', label: 'BRV' },
];

const CreateVoucher = () => {
  const [voucherType, setVoucherType] = useState(voucherTypeOptions[0]); // Default to "JV"
  const [voucherDate, setVoucherDate] = useState('');
  const [note, setNote] = useState('');
  const [voucherDetails, setVoucherDetails] = useState([]); // Stores voucher details
  const [customVoucherId, setCustomVoucherId] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch vouchers and calculate ID
  const fetchAndSetCustomVoucherId = async (selectedType) => {
    try {
      const res = await axios.get('https://accounts-management.onrender.com/common/voucher/getAll');
      const allVouchers = res?.data || [];
      const filtered = allVouchers.filter(v => v.voucher_type === selectedType);
      const newId = filtered.length + 1;
      setCustomVoucherId(newId);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setLoading(false);
      setCustomVoucherId('');
    }
  };

  useEffect(() => {
    fetchAndSetCustomVoucherId('JV');
  }, []);

  const handleVoucherTypeChange = (selectedOption) => {
    setVoucherType(selectedOption);
    if (selectedOption?.value) {
      fetchAndSetCustomVoucherId(selectedOption.value);
    } else {
      setCustomVoucherId('');
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // 1. Check totals before proceeding
  const totalDebit = voucherDetails.reduce(
    (sum, d) => sum + parseFloat(d.debit || 0),
    0
  );
  const totalCredit = voucherDetails.reduce(
    (sum, d) => sum + parseFloat(d.credit || 0),
    0
  );

  if (totalDebit !== totalCredit) {
    toast(
      "⚠️ Debit and credit amounts must be equal before submitting the voucher.",
      {
        icon: '⚠️',
        style: {
          border: '1px solid #facc15',
          padding: '12px',
          color: '#92400e',
          background: '#fef9c3',
        },
      }
    );
    setLoading(false);
    return;
  }

  const voucherPayload = {
    voucher_id: customVoucherId, // Include custom ID
    voucher_type: voucherType.value,
    voucher_date: voucherDate,
    note,
  };

  try {
    const res = await axios.post(
      'https://accounts-management.onrender.com/common/voucher/create',
      voucherPayload
    );
    const voucherId = res?.data?.id;

    if (!voucherId) throw new Error('Voucher creation failed.');

    // Process voucher details only if voucher creation is successful
    const processedEntries = voucherDetails
      .filter((row) => parseFloat(row.debit || 0) > 0 || parseFloat(row.credit || 0) > 0)
      .map((row) => ({
        main_id: voucherId,
        account_code: row.account_code || '',
        particulars: row.particulars || '',
        debit: parseFloat(row.debit || 0),
        credit: parseFloat(row.credit || 0),
      }));

    for (const entry of processedEntries) {
      await axios.post(
        'https://accounts-management.onrender.com/common/voucherDetail/create',
        entry
      );
    }

    toast.success('✅ Voucher and details created successfully!');
    setVoucherType(voucherTypeOptions[0]);
    setVoucherDate('');
    setNote('');
    setVoucherDetails([]);
    fetchAndSetCustomVoucherId('JV');
  } catch (err) {
    console.error(err);
    toast.error('❌ An error occurred while creating the voucher.');
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
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Create New Voucher</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6 w-32">
          <label className="block text-gray-700 font-medium mb-2">Voucher ID</label>
          <input
            type="text"
            value={customVoucherId}
            readOnly
            className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-not-allowed text-gray-600"
          />
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Voucher Type</label>
            <Select
              options={voucherTypeOptions}
                         value={voucherType}
              onChange={handleVoucherTypeChange}
              placeholder="Select Voucher Type"
              className="text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Voucher Date</label>
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="Enter notes..."
          />
        </div>

        {/* Voucher Details Table */}
        <VoucherDetailTable
          voucherDetails={voucherDetails}
          setVoucherDetails={setVoucherDetails}
        />

        <div className="mt-8">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold"
          >
            Submit Voucher
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVoucher;


 
