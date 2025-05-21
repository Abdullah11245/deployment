'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './CP_CRtable';
import Select from 'react-select';
import './Sale.css';
import toast, { Toaster } from 'react-hot-toast';

const voucherTypeOptions = [
  { value: 'CP', label: 'CP' },
  { value: 'CR', label: 'CR' },
];

const CreateVoucher = () => {
  const [voucherType, setVoucherType] = useState(voucherTypeOptions[0]); // 👈 Default to "BP"
  const [voucherDate, setVoucherDate] = useState('');
  const [note, setNote] = useState('');
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [customVoucherId, setCustomVoucherId] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch vouchers and calculate ID
  const fetchAndSetCustomVoucherId = async (selectedType) => {
    try {
      const res = await axios.get('https://accounts-management.onrender.com/common/voucher/getAll');
      const allVouchers = res?.data || [];
      const filtered = allVouchers.filter(v => v.voucher_type === selectedType);
  
      const maxId = filtered.reduce((max, v) => Math.max(max, parseInt(v.voucher_id) || 0), 0);
      setCustomVoucherId(maxId + 1);
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setCustomVoucherId('');
    }
  };

  useEffect(() => {
    fetchAndSetCustomVoucherId('CP');
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
  
  setLoading(true)
  
    const voucherPayload = {
      voucher_id: customVoucherId,
      voucher_type: voucherType.value,
      voucher_date: voucherDate,
      note,
    };
  
    try {
      const res = await axios.post('https://accounts-management.onrender.com/common/voucher/create', voucherPayload);
      const voucherId = res?.data?.id;
  
      if (!voucherId) throw new Error('Voucher creation failed.');
  
      for (const detail of voucherDetails) {
        let debitEntry, creditEntry;
      
        if (voucherType.value === 'CP') {
          debitEntry = {
            main_id: voucherId,
            account_code: detail.account_code,
            particulars: `${detail.particulars}`,
            debit: parseFloat(detail.debit || 0),
            credit: 0,
          };
      
          creditEntry = {
            main_id: voucherId,
            account_code:'1110001',
            particulars: `${detail.particulars}`,
            debit: 0,
            credit: parseFloat(detail.debit || 0),
          };
        } else if (voucherType.value === 'CR') {
         
          creditEntry = {
            main_id: voucherId,
            account_code: detail.account_code,
            particulars: `${detail.particulars} Recieved by :${detail.title}`,
            debit: 0,
            credit: parseFloat(detail.credit || 0),
          };
          debitEntry = {
            main_id: voucherId,
            account_code: '1110001',
            particulars: `${detail.particulars} Recieved by :${detail.title}`,
            debit: parseFloat(detail.credit || 0),
            credit: 0,
          };
      
        }

        await axios.post('https://accounts-management.onrender.com/common/voucherDetail/create', debitEntry);
        await axios.post('https://accounts-management.onrender.com/common/voucherDetail/create', creditEntry);
      }
        
  setLoading(false)
      toast.success('Voucher and details created successfully!');
      setVoucherType(voucherTypeOptions[0]);
      setVoucherDate('');
      setNote('');
      setVoucherDetails([]);
      fetchAndSetCustomVoucherId(voucherTypeOptions[0].value);
    } catch (err) {
      setLoading(false)
      console.error('An error occurred while creating the voucher:', err);
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

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 min-h-64"
            placeholder="Enter notes..."
          />
        </div>

        <VoucherDetailTable
          voucherDetails={voucherDetails}
          setVoucherDetails={setVoucherDetails}
          voucherType={voucherType.value}
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
