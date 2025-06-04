'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './CP_CRtable'; // same table used in create
import Select from 'react-select';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../../../../api_url';

const voucherTypeOptions = [
  { value: 'CP', label: 'CP' },
  { value: 'CR', label: 'CR' },
];

const EditVoucher = () => {
  const [voucherType, setVoucherType] = useState(voucherTypeOptions[0]);
  const [voucherDate, setVoucherDate] = useState('');
  const [note, setNote] = useState('');
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [customVoucherId, setCustomVoucherId] = useState('');
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
        const voucherRes = await axios.get(`${end_points}/voucher/${id}`);
        const detailRes = await axios.get(`${end_points}/voucherDetail/main/${id}`);

        const voucher = voucherRes.data;
        const details = detailRes.data || [];

        setVoucherType({ value: voucher.voucher_type, label: voucher.voucher_type });
        setVoucherDate(voucher.voucher_date?.split('T')[0]);
        setNote(voucher.note);
        setCustomVoucherId(voucher.voucher_id);

        const formattedDetails = [];

        for (let i = 0; i < details.length; i += 2) {
          const debit = details[i];
          const credit = details[i + 1];

          formattedDetails.push({
            account_code: voucher.voucher_type === 'CP' ? debit.account_code : credit.account_code,
            title: (debit.particulars || '').split('Recieved by :')[1]?.trim() || '',
            particulars: (debit.particulars || '').split('Recieved by :')[0]?.trim(),
            debit: voucher.voucher_type === 'CP' ? debit.debit : '',
            credit: voucher.voucher_type === 'CR' ? credit.credit : '',
          });
        }

        setVoucherDetails(formattedDetails);
        setLoading(false)
      } catch (err) {

        setLoading(false)
        toast.error('Failed to load voucher.');
      }
    };

    fetchVoucherData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalDebit = voucherDetails.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);
    const totalCredit = voucherDetails.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);
  
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
      return;
    }
   setLoading(true)
    const payload = {
      voucher_id: customVoucherId,
      voucher_type: voucherType.value,
      voucher_date: voucherDate,
      note,
    };

    try {
      await axios.put(`${end_points}/voucher/${id}`, payload);

      let detailIndex = 0;
      for (const detail of voucherDetails) {
        const commonParticulars = `${detail.particulars} Recieved by :${detail.title}`;
        const amount = parseFloat(detail.debit || detail.credit || 0);

        const debitEntry = {
          main_id: id,
          account_code: voucherType.value === 'CP' ? detail.account_code : '1110001',
          particulars: commonParticulars,
          debit: voucherType.value === 'CP' ? amount : amount,
          credit: 0,
        };

        const creditEntry = {
          main_id: id,
          account_code: voucherType.value === 'CP' ? '1110001' : detail.account_code,
          particulars: commonParticulars,
          debit: 0,
          credit: amount,
        };

        await axios.put(
          `${end_points}/voucherDetail/update/${voucherType.value}/${customVoucherId}/${detailIndex}`,
          debitEntry
        );

        await axios.put(
          `${end_points}/voucherDetail/update/${voucherType.value}/${customVoucherId}/${detailIndex + 1}`,
          creditEntry
        );

        detailIndex += 2;
      }
setLoading(false)
      toast.success('Voucher updated successfully!');
    } catch (err) {
      setLoading(false)
      toast.error('Update failed.');
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Voucher</h2>
                  <Toaster position="top-right" reverseOrder={false} />

      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-2 gap-6 mb-6'>
 <div>
            <label className="block text-gray-700 font-medium mb-2">Custom Voucher ID</label>
            <input
              type="text"
              value={customVoucherId}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Voucher Type</label>
            <Select
              options={voucherTypeOptions}
              value={voucherType}
              isDisabled
              placeholder="Select Voucher Type"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Voucher Date</label>
            <input
              type="date"
              value={voucherDate || ''}
              onChange={(e) => setVoucherDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
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
            Update Voucher
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVoucher;
