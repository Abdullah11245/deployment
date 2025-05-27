'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import end_points from '../../../../../api_url';

const VoucherDetailTable = ({ voucherDetails, setVoucherDetails, voucherType }) => {
  const [mainOptions, setMainOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Always fetch banks
        const bankRes = await fetch(`${end_points}/banks/getAll`);
        const bankData = await bankRes.json();
        setBankOptions(
          bankData.map((bank) => ({
            value: bank.account_code,
            label: bank.account_title,
          }))
        );

        // Fetch either customers or suppliers based on type
        if (voucherType =='BR') {
          const res = await fetch(`${end_points}/parties/getAll`);
          const data = await res.json();
          console.log(data.data);
          setMainOptions(
            data.map((p) => ({
              value: p.party_code,
              label: p.name,
            }))
          );
        } else if (voucherType == 'BP') {
          const res = await fetch(`${end_points}/suppliers/getAll`);
          const data = await res.json();
          setMainOptions(
            data.suppliers.map((s) => ({
              value: s.supplier_code,
              label: s.name,
            }))
          );
        } else {
          setMainOptions([]); // or default to other data
        }
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchOptions();
  }, [voucherType]);

  const handleInputChange = (index, field, value) => {
    const updated = [...voucherDetails];
    const currentRow = updated[index];
  
    if (field === 'account_code') {
      const selected = mainOptions.find(opt => opt.value === value);
      updated[index] = {
        ...currentRow,
        [field]: value,
        party_name: selected?.label || '',
      };
    } else if (field === 'bank_account_code') {
      const selectedBank = bankOptions.find(opt => opt.value === value);
      const bankTitle = selectedBank?.label || '';
  
      updated[index] = {
        ...currentRow,
        [field]: value,
        bank_name: bankTitle,
        // Removed auto-editing of particulars here
      };
    } else {
      updated[index] = {
        ...currentRow,
        [field]: value,
      };
    }
  
    setVoucherDetails(updated);
  };
  
  

  const addRow = () => {
    setVoucherDetails([
      ...voucherDetails,
      {
        account_code: '',
        bank_account_code: '',
        particulars: '',
        debit: '',
        credit: '',
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...voucherDetails];
    updated.splice(index, 1);
    setVoucherDetails(updated);
  };

  const totalDebit = voucherDetails.reduce(
    (sum, item) => sum + (parseFloat(item.debit) || 0),
    0
  );
  const totalCredit = voucherDetails.reduce(
    (sum, item) => sum + (parseFloat(item.credit) || 0),
    0
  );

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-md mt-8">
      <table className="min-w-full border border-gray-200 ">
        <thead className="bg-gray-500 text-white">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">
              {voucherType === 'BR' ? 'Customer' : voucherType === 'BP' ? 'Supplier' : 'Account'}
            </th>
            <th className="px-4 py-2 text-left">Bank</th>
            <th className="px-4 py-2 text-left">Particulars</th>
            <th className="px-4 py-2 text-right">Debit</th>
            <th className="px-4 py-2 text-right">Credit</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {voucherDetails.map((row, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>

              {/* Customer / Supplier Dropdown */}
              <td className="px-4 py-2 w-64">
                <Select
                  value={mainOptions.find((opt) => opt.value === row.account_code) || null}
                  onChange={(selected) =>
                    handleInputChange(index, 'account_code', selected?.value || '')
                  }
                  options={mainOptions}
                  placeholder="Select"
                  isClearable
                />
              </td>

              {/* Bank Dropdown */}
              <td className="px-4 py-2 w-64">
              <Select
  value={bankOptions.find((opt) => opt.value === row.bank_account_code) ||''}
  onChange={(selected) =>
    handleInputChange(index, 'bank_account_code', selected?.value || '')
  }
  options={bankOptions}
  placeholder="Select Bank"
  isClearable
/>

              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.particulars}
                  onChange={(e) => handleInputChange(index, 'particulars', e.target.value)}
                  className="w-full border rounded px-2 py-3"
                  placeholder="e.g. Payment for..."
                />
              </td>

              <td className="px-4 py-2 text-right">
                <input
                  type="text"
                  value={row.debit}
                  onChange={(e) => handleInputChange(index, 'debit', e.target.value)}
                  className="w-28 border rounded px-2 py-3 text-right"
                  placeholder="0"
                />
              </td>

              <td className="px-4 py-2 text-right">
                <input
                  type="text"
                  value={row.credit}
                  onChange={(e) => handleInputChange(index, 'credit', e.target.value)}
                  className="w-28 border rounded px-2 py-3 text-right"
                  placeholder="0"
                />
              </td>

              <td className="px-4 py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 border-t font-semibold">
            <td colSpan="4" className="px-4 py-2 text-right">Totals</td>
            <td className="px-4 py-2 text-right">{formatCurrencyPK(totalDebit.toFixed(2))}</td>
            <td className="px-4 py-2 text-right">{formatCurrencyPK(totalCredit.toFixed(2))}</td>
            <td />
          </tr>
        </tbody>
      </table>

      <div className="p-4 flex justify-end">
        <button
          type="button"
          onClick={addRow}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Row
        </button>
      </div>
    </div>
  );
};

export default VoucherDetailTable;
