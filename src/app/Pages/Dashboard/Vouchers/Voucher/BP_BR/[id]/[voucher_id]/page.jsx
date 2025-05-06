'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherDetailTable from './BP_BRtable';
import Select from 'react-select';
import { useParams } from 'next/navigation';
import './Sale.css';
import toast, { Toaster } from 'react-hot-toast';

const voucherTypeOptions = [
  { value: 'BP', label: 'BP' },
  { value: 'BR', label: 'BR' },
];

const EditVoucher = () => {
  const [voucherType, setVoucherType] = useState(voucherTypeOptions[0]);
  const [voucherDate, setVoucherDate] = useState('');
  const [note, setNote] = useState('');
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [customVoucherId, setCustomVoucherId] = useState('');
  const { id, voucher_id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucherData = async () => {
      if (!id) return;

      try {
        // Fetch voucher metadata (to populate the form)
        const voucherRes = await axios.get(`https://accounts-management.onrender.com/common/voucher/${id}`);
        
        // Fetch voucher details data
        const detailRes = await axios.get(`https://accounts-management.onrender.com/common/voucherDetail/main/${id}`);
        
        const voucherData = voucherRes?.data;
        const voucherDetailsData = detailRes?.data || [];
  
  
        if (voucherData) {
          setVoucherType({ value: voucherData.voucher_type, label: voucherData.voucher_type });
          setVoucherDate(voucherData.voucher_date);
          setNote(voucherData.note);
          setCustomVoucherId(voucherData.voucher_id);
        }
  
        const formattedDetails = [];
  
        voucherDetailsData.forEach((entry) => {
          if (entry.debit > 0) {
            const [particulars, party_name] = entry.particulars.split(' from ');
            formattedDetails.push({
              account_code: entry.account_code,
              particulars: particulars?.trim() || '',
              party_name: party_name?.trim() || '',
              debit: entry.debit,
              credit: '', // Will be filled later if there's a matching credit entry
            });
          } else if (entry.credit > 0) {
            const [particulars, bank_name] = entry.particulars.split(' into ');
            const lastEntry = formattedDetails[formattedDetails.length - 1];
  
            if (lastEntry && lastEntry.credit === '') {
              lastEntry.credit = entry.credit;
              lastEntry.bank_account_code = entry.account_code;
              lastEntry.bank_name = bank_name?.trim() || '';
            } else {
              // Handle the case where there might be an unmatched credit entry
              formattedDetails.push({
                bank_account_code: entry.account_code,
                bank_name: bank_name?.trim() || '',
                debit: '', // No debit for this row
                credit: entry.credit,
                particulars: particulars?.trim() || '',
                party_name: '', // No party name for this row
                account_code: '', // No account code for this row
              });
            }
          }
        });
  
        setVoucherDetails(formattedDetails);
        setLoading(false)

      } catch (err) {
        setLoading(false)
        toast.error("Failed to load voucher for editing.");
      }
    };

    fetchVoucherData();
  }, [id]);

  
  const handleVoucherTypeChange = (selectedOption) => {
    setVoucherType(selectedOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalDebit = voucherDetails.reduce((acc, detail) => acc + Number(detail.debit || 0), 0);
    const totalCredit = voucherDetails.reduce((acc, detail) => acc + Number(detail.credit || 0), 0);
  
    if (totalDebit !== totalCredit) {
      toast.warning("Voucher debit and credit totals must be equal. Please adjust the entries.");
      return; // prevent form submission
    }
  setLoading(true)

    const voucherPayload = {
      voucher_id: customVoucherId, // 👈 Include custom ID
      voucher_type: voucherType.value,
      voucher_date: voucherDate,
      note,
    };

    try {
      await axios.put(`https://accounts-management.onrender.com/common/voucher/${id}`, voucherPayload);

      // Update each detail
      let detailIndex = 0;

for (const detail of voucherDetails) {
  const debitEntry = {
    main_id: id,
    account_code: detail.account_code,
    particulars: `${detail.particulars} from ${detail.party_name}`, 
    debit: detail.debit,
    credit: 0,
  };

  const creditEntry = {
    main_id: id,
    account_code: detail.bank_account_code, 
    particulars: `${detail.particulars} into ${detail.bank_name}`,
    debit: 0,
    credit: detail.credit,
  };

  console.log(debitEntry, 'debitEntry', detailIndex);
  try {
    // Debit entry at current index
    await axios.put(
      `https://accounts-management.onrender.com/common/voucherDetail/update/${voucherType.value}/${voucher_id}/${detailIndex}`,
      debitEntry
    );

    detailIndex++; 

   
    await axios.put(
      `https://accounts-management.onrender.com/common/voucherDetail/update/${voucherType.value}/${voucher_id}/${detailIndex}`,
      creditEntry
    );

    detailIndex++; // increment again for next loop pair
  } catch (error) {
    console.error("Error updating voucher detail for item:", detail, error);
  }
}
 setLoading(false)
      toast.success('Voucher and details updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while updating the voucher.');
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
              onChange={handleVoucherTypeChange}
              placeholder="Select Voucher Type"
              className="text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Voucher Date</label>
            <input
              type="date-time-local"
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
