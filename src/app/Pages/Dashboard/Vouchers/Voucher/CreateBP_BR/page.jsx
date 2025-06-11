'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './BP_BRtable';
import Select from 'react-select';
import './Sale.css';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../../api_url';

const voucherTypeOptions = [
  { value: 'BP', label: 'BP' },
  { value: 'BR', label: 'BR' },
];

// Get initial voucher type from localStorage
const getInitialVoucherType = () => {
  const storedType = localStorage.getItem('voucherType');
  if (storedType) {
    const cleanedType = storedType.replace('.', '').toUpperCase(); // e.g. "B.R" → "BR"
    const matched = voucherTypeOptions.find(option => option.value === cleanedType);
    return matched || voucherTypeOptions[0];
  }
  return voucherTypeOptions[0];
};

const CreateVoucher = () => {
  const [voucherType, setVoucherType] = useState(getInitialVoucherType());
  const [voucherDate, setVoucherDate] = useState('');
  const [note, setNote] = useState('');
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [customVoucherId, setCustomVoucherId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAndSetCustomVoucherId = async (selectedType) => {
    try {
      const res = await axios.get(`${end_points}/voucher/getAll`);
      const allVouchers = res?.data || [];
      const filtered = allVouchers.filter(v => v.voucher_type === selectedType);
      const maxId = filtered.reduce((max, v) => Math.max(max, parseInt(v.voucher_id) || 0), 0);
      setCustomVoucherId(maxId + 1);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setCustomVoucherId('');
      setLoading(false);
    }
  };

  // Initial fetch using cleaned localStorage value
  useEffect(() => {
    fetchAndSetCustomVoucherId(voucherType.value);
  }, []);

  const handleVoucherTypeChange = (selectedOption) => {
    setVoucherType(selectedOption);
    localStorage.setItem('voucherType', selectedOption.value); // Save cleaned type to localStorage
    if (selectedOption?.value) {
      fetchAndSetCustomVoucherId(selectedOption.value);
    } else {
      setCustomVoucherId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const voucherPayload = {
      voucher_id: customVoucherId,
      voucher_type: voucherType.value,
      voucher_date: voucherDate,
      note,
    };

    try {
      const res = await axios.post(`${end_points}/voucher/create`, voucherPayload);
      const voucherId = res?.data?.id;

      if (!voucherId) throw new Error('Voucher creation failed.');

      const isBP = voucherType.value === 'BP';

      for (const detail of voucherDetails) {
        const debitEntry = {
          main_id: voucherId,
          account_code: detail.account_code,
          particulars: `${detail.particulars} ${isBP ? 'of' : 'from'} ${detail.bank_name}`,
          debit: detail.debit,
          credit: 0,
        };

        const creditEntry = {
          main_id: voucherId,
          account_code: detail.bank_account_code,
          particulars: `${detail.particulars} ${isBP ? 'into' : 'from'} ${detail.party_name}`,
          debit: 0,
          credit: detail.credit,
        };

        try {
          await axios.post(`${end_points}/voucherDetail/create`, debitEntry);
          await axios.post(`${end_points}/voucherDetail/create`, creditEntry);
        } catch (error) {
          console.error("Error creating voucher detail for item:", detail, error);
        }
      }

      toast.success('Voucher and details created successfully!');
      // Reset form
      setVoucherType(voucherTypeOptions[0]);
      setVoucherDate('');
      setNote('');
      setVoucherDetails([]);
      fetchAndSetCustomVoucherId(voucherTypeOptions[0].value);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('An error occurred while creating the voucher.');
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
        <div className='mb-6 w-32'>
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

        <VoucherDetailTable
          voucherDetails={voucherDetails}
          setVoucherDetails={setVoucherDetails}
          voucherType={voucherType.value}
        />

        <div className="mb-6 mt-6">
          <label className="block text-gray-700 font-medium mb-2">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="Enter notes..."
          />
        </div>

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
