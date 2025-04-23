'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './JV_BRVtable';
import Select from 'react-select';
import './Sale.css';

const voucherTypeOptions = [
  { value: 'JV', label: 'JV' },
  { value: 'BRV', label: 'BRV' },
];

const CreateVoucher = () => {
  const [voucherType, setVoucherType] = useState(voucherTypeOptions[0]); // 👈 Default to "BP"
  const [voucherDate, setVoucherDate] = useState('');
  const [note, setNote] = useState('');
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [customVoucherId, setCustomVoucherId] = useState('');

  // Fetch vouchers and calculate ID
  const fetchAndSetCustomVoucherId = async (selectedType) => {
    try {
      const res = await axios.get('https://accounts-management.onrender.com/common/voucher/getAll');
      const allVouchers = res?.data || [];
      const filtered = allVouchers.filter(v => v.voucher_type === selectedType);
      const newId = filtered.length + 1;
      setCustomVoucherId(newId);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
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

    if (!voucherType || !voucherDate || voucherDetails.length === 0) {
      alert('Please fill in all required fields and add at least one detail entry.');
      return;
    }

    const voucherPayload = {
      voucher_id: customVoucherId, // 👈 Include custom ID
      voucher_type: voucherType.value,
      voucher_date: voucherDate,
      note,
    };

    try {
      const res = await axios.post('https://accounts-management.onrender.com/common/voucher/create', voucherPayload);
      const voucherId = res?.data?.id;

      if (!voucherId) throw new Error('Voucher creation failed.');

      const detailRequests = voucherDetails.map(detail => {
        return axios.post('https://accounts-management.onrender.com/common/voucherDetail/create', {
          main_id: voucherId,
          account_code: detail.account_code,
          particulars: detail.particulars,
          debit: parseFloat(detail.debit || 0),
          credit: parseFloat(detail.credit || 0),
        });
      });

      await Promise.all(detailRequests);

      alert('Voucher and details created successfully!');

      // Reset form to default "BP"
      setVoucherType(voucherTypeOptions[0]);
      setVoucherDate('');
      setNote('');
      setVoucherDetails([]);
      fetchAndSetCustomVoucherId('BP');
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the voucher.');
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Create New Voucher</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6 mb-6">
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
              type="datetime-local"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Custom Voucher ID</label>
            <input
              type="text"
              value={customVoucherId}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-not-allowed text-gray-600"
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
