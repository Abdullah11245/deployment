'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './JV_BRVtable'; // same table used in create
import Select from 'react-select';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const voucherTypeOptions = [
  { value: 'JV', label: 'JV' },
  { value: 'BRV', label: 'BRV' },
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
        const voucherRes = await axios.get(`https://accounts-management.onrender.com/common/voucher/${id}`);
        const detailRes = await axios.get(`https://accounts-management.onrender.com/common/voucherDetail/main/${id}`);

        const voucher = voucherRes.data;
        const details = detailRes.data || [];
        console.log(details)
        setVoucherType({ value: voucher.voucher_type, label: voucher.voucher_type });
        setVoucherDate(voucher.voucher_date?.split('T')[0]);
        setNote(voucher.note);
        setCustomVoucherId(voucher.voucher_id);

       

        const formattedDetails = [];
        for (let i = 0; i < details.length; i++) {
          const detail = details[i];
          const [particularsText, titleText] = (detail.particulars || '').split('Recieved by :');
        
          formattedDetails.push({
            account_code: detail.account_code,
            title: titleText?.trim() || '',
            particulars: particularsText?.trim() || '',
            debit: detail.debit,
            credit: detail.credit,
          });
        }
        
        
        setVoucherDetails(formattedDetails);
        
setLoading(false)
      } catch (err) {
        setLoading(false)
        console.error('Error fetching voucher:', err);
        toast.error('Failed to load voucher.');
      }
    };

    fetchVoucherData();
  }, [id]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    const totalDebit = voucherDetails.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);
    const totalCredit = voucherDetails.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);

    if (voucherType == 'BRV' &&totalDebit !== totalCredit) {
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
    setLoading(true);
    const payload = {
      voucher_id: customVoucherId,
      voucher_type: voucherType.value,
      voucher_date: voucherDate,
      note,
    };

    try {
      await axios.put(`https://accounts-management.onrender.com/common/voucher/${id}`, payload);

      if (voucherType.value === 'BRV') {
       setLoading(true);
        for (let i = 0; i < voucherDetails.length; i++) {
          const detail = voucherDetails[i];
        
          const entry = {
            main_id: id,
            account_code: detail.account_code,
            particulars: `${detail.particulars} Recieved by :${detail.title || ''}`,
            debit: parseFloat(detail.debit || 0),
            credit: parseFloat(detail.credit || 0),
          };
        
          await axios.put(
            `https://accounts-management.onrender.com/common/voucherDetail/update/${voucherType.value}/${customVoucherId}/${i}`,
            entry
          );
        }
      } else if (voucherType.value === 'JV') {
         setLoading(true);
  const processedEntries = [];

  let totalDebit = 0;
  let totalCredit = 0;

  // Step 1: Ignore old 5110001 entries and only process user entries
  const userEntries = voucherDetails.filter(detail => detail.account_code !== '5110001');

  // Step 2: Add user entries and calculate totals
  userEntries.forEach((detail) => {
    const debit = parseFloat(detail.debit || 0);
    const credit = parseFloat(detail.credit || 0);

    totalDebit += debit;
    totalCredit += credit;

    processedEntries.push({
      main_id: id,
      account_code: detail.account_code,
      particulars: detail.particulars,
      debit,
      credit,
    });
  });

  // Step 3: Add the updated balancing entry (5110001)
  if (totalDebit !== totalCredit) {
    const diff = Math.abs(totalDebit - totalCredit);
    const isDebitGreater = totalDebit > totalCredit;

    processedEntries.push({
      main_id: id,
      account_code: '5110001',
      particulars: `${userEntries[0]?.particulars || ''} of ${userEntries[0]?.label || ''}`,
      debit: isDebitGreater ? 0 : diff,
      credit: isDebitGreater ? diff : 0,
    });
  }

  // Step 4: Perform the update with PUT requests
  try {
    for (let i = 0; i < processedEntries.length; i++) {
      await axios.put(
        `https://accounts-management.onrender.com/common/voucherDetail/update/${voucherType.value}/${customVoucherId}/${i}`,
        processedEntries[i]
      );
    }
  } catch (error) {
    console.error('Error updating JV voucher details:', error);
    toast.error('Failed to update JV voucher details.');
  }
}




      setLoading(false);
      toast.success('Voucher updated successfully!');
    } catch (err) {
      setLoading(false);
      toast.error('Update failed.');
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Voucher</h2>
      <Toaster position="top-right" reverseOrder={false} />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6 mb-6">
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
          voucherType={voucherType.value}
        />

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
