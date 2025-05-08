'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const EditDiaryVoucher = () => {
  const { id, voucher_id } = useParams(); // id = diary voucher ID
const voucher_type='DV'
console.log(id)
console.log(voucher_id)
  const [loading, setLoading] = useState(true);

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
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [banksRes, suppliersRes, diaryVoucherRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/banks/getAll'),
          axios.get('https://accounts-management.onrender.com/common/suppliers/getAll'),
          axios.get(`https://accounts-management.onrender.com/common/diaryVoucher/diary/${voucher_id}`),
        ]);
        setBanks(banksRes.data || []);
        setSuppliers(suppliersRes.data.suppliers || []);

        const data = diaryVoucherRes.data;
        console.log(data.supplier_code)
        setFormData({
          issue_date: data.issue_date?.split('T')[0] || '',
          cheque_date: data.cheque_date?.split('T')[0] || '',
          cheque_no: data.cheque_no || '',
          cheque_amount: data.cheque_amount || '',
          bank_code: data.bank_code || '',
          supplier_code: data.supplier_code|| '',
          particulars: data.particulars || '',
          notes: data.notes || '',
          dv_status: data.dv_status || 'A',
        });
      } catch (err) {
        console.error('Error loading initial data:', err);
        toast.error('Failed to load voucher data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSupplierChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      supplier_code: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Diary Voucher
      await axios.put(
        `https://accounts-management.onrender.com/common/diaryVoucher/diary/${voucher_id}`,
        formData
      );

      // 2. Update Voucher
      const voucherPayload = {
        voucher_id: voucher_id,
        voucher_type: 'DV',
        voucher_date: formData.issue_date,
        note: formData.notes,
      };

      await axios.put(
        `https://accounts-management.onrender.com/common/voucher/${voucher_id}`,
        voucherPayload
      );

      // 3. Update Voucher Details using for loop
      const bank = banks.find((b) => b.account_code === formData.bank_code);
      const supplier = suppliers.find((s) => s.account_code === formData.supplier_code);

      const bankName = bank?.account_title || 'Unknown Bank';
      const supplierName = supplier?.account_title || 'Unknown Supplier';
      const chequeInfo = `${formData.issue_date?.split('T')[0]} ${formData.cheque_no || ''}`.trim();

      const details = [
        {
          account_code: formData.bank_code,
          particulars: `${bankName} ${chequeInfo}`,
          debit: Number(formData.cheque_amount || 0),
          credit: 0,
        },
        {
          account_code: formData.supplier_code,
          particulars: `${supplierName} ${chequeInfo}`,
          debit: 0,
          credit: Number(formData.cheque_amount || 0),
        },
      ];

      for (let i = 0; i < details.length; i++) {
        await axios.put(
          `https://accounts-management.onrender.com/common/voucherDetail/update/${voucher_type}/${id}/${i}`,
          {
            main_id: id,
            ...details[i],
          }
        );
      }

      toast.success('Diary Voucher updated successfully!');
    } catch (err) {
      console.error('Error updating voucher:', err);
      toast.error('Failed to update voucher. Please try again.');
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
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>

        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Edit Diary Voucher</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Diary Voucher ID </label>

        <input
              type="text"
              name=""
              value={voucher_id}
              disabled
              className="w-full border border-gray-300 px-4 py-2 rounded-md w-40"
              required
            />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Issue Date</label>
            <input
              type="date"
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
              type="date"
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
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              required
            >
              <option value="">Select Bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.account_code}>
                  {bank.account_title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Supplier</label>
            <Select
              options={suppliers.map((s) => ({
                value: s.supplier_code,
                label: s.name,
              }))}
              onChange={handleSupplierChange}
              value={suppliers
                .map((s) => ({
                  value: s.supplier_code,
                  label: s.name,
                }))
                .find((option) => option.value === formData.supplier_code) || null}
              className="text-sm"
              placeholder="Select Supplier"
              isClearable
            />
          </div>
        </div>

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
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
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
          Update Diary Voucher
        </button>
      </form>
    </div>
  );
};

export default EditDiaryVoucher;
