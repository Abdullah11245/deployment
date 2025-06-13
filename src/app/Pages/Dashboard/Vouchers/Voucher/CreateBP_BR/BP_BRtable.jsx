'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import end_points from '../../../../../api_url';

const VoucherDetailTable = ({ voucherDetails, setVoucherDetails, voucherType }) => {
   const [accountOptions, setAccountOptions] = useState([]);

  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Always fetch banks
        const initials = [
          { account_title: 'Cash', account_code: '1110001' },
          { account_title: 'Sales Tax ()', account_code: '2120001' },
          { account_title: 'Adjusted Balances ()', account_code: '5110001' },
          { account_title: 'Inventory', account_code: '1140001' },
          { account_title: 'Deduction of W.H.T by Azhar Corp. (Pvt.) Ltd.', account_code: '1150001' },
          { account_title: 'Deduction of W.H.T by Salva Feed (Pvt.) Ltd.', account_code: '1150002' },
          { account_title: 'Deduction of W.H.T by Sadiq Feed (Pvt.) Ltd.', account_code: '1150003' },
        ];

        const [bankRes, partyRes, supplierRes] = await Promise.all([
          fetch(`${end_points}/banks/getAll`),
          fetch(`${end_points}/parties/getAll`),
          fetch(`${end_points}/suppliers/getAll`),
        ]);

        const banks = await bankRes.json();
        const parties = await partyRes.json();
        const suppliersData = await supplierRes.json();
        const suppliers = suppliersData?.suppliers || [];

        const bankMapped = banks.map((b) => ({
          label: b.account_title,
          value: b.account_code,
        }));

        const partyMapped = parties.map((p) => ({
          label: p.name,
          value: p.party_code,
        }));

        const supplierMapped = suppliers.map((s) => ({
          label: s.name,
          value: s.supplier_code,
        }));

        const initialMapped = initials.map((i) => ({
          label: i.account_title,
          value: i.account_code,
        }));

        const grouped = [
          { label: 'Banks', options: bankMapped },
          { label: 'Parties', options: partyMapped },
          { label: 'Suppliers', options: supplierMapped },
          { label: 'Initial Accounts', options: initialMapped },
        ];

        setAccountOptions(grouped);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchOptions();
  }, [voucherType]);

const flattenOptions = (grouped) => {
  return grouped.reduce((acc, group) => acc.concat(group.options), []);
};

const handleInputChange = (index, field, value) => {
  const updated = [...voucherDetails];
  const currentRow = updated[index];

  const flatOptions = flattenOptions(accountOptions);
  const selected = flatOptions.find((opt) => opt.value === value);

  if (field === 'account_code') {
    updated[index] = {
      ...currentRow,
      [field]: value,
      party_name: selected?.label || '',
    };
  } else if (field === 'bank_account_code') {
    updated[index] = {
      ...currentRow,
      [field]: value,
      bank_name: selected?.label || '',
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
            <th className="px-4 py-2 text-left"></th>
            <th className="px-4 py-2 text-left">
Account
            </th>
            <th className="px-4 py-2 text-left">Account</th>
            <th className="px-4 py-2 text-left">Particulars</th>
            <th className="px-4 py-2 text-right">Debit</th>
            <th className="px-4 py-2 text-right">Credit</th>
            {/* <th className="px-4 py-2 text-center">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {voucherDetails.map((row, index) => (
            <tr key={index} className="border-t space-x-4">
               <td className="px-2 py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </td>

            
              <td className="px-2 py-2 w-48">
               <Select
  value={flattenOptions(accountOptions).find((opt) => opt.value === row.account_code) || null}
  onChange={(selected) =>
    handleInputChange(index, 'account_code', selected?.value || '')
  }
  options={accountOptions}
  placeholder="Account"
  isClearable
  className="text-black"
/>
              </td>

             
              <td className="px-2 py-2 w-48">
            <Select
  value={flattenOptions(accountOptions).find((opt) => opt.value === row.bank_account_code) || null}
  onChange={(selected) =>
    handleInputChange(index, 'bank_account_code', selected?.value || '')
  }
  options={accountOptions}
  placeholder="Account"
  isClearable
  className="text-black"
/>

              </td>

              <td className="px-2 py-2">
                <input
                  type="text"
                  value={row.particulars}
                  onChange={(e) => handleInputChange(index, 'particulars', e.target.value)}
                  className="w-full border rounded px-2 py-3 text-black"
                  placeholder="e.g. Payment for..."
                />
              </td>

              <td className="px-2 py-2 w-28  text-right">
                <input
                  type="text"
                  value={row.debit}
                  onChange={(e) => handleInputChange(index, 'debit', e.target.value)}
                  className="border w-28  rounded px-2 py-3 text-right text-black"
                  placeholder="0"
                />
              </td>

              <td className="px-2 py-2 w-28 text-right">
                <input
                  type="text"
                  value={row.credit}
                  onChange={(e) => handleInputChange(index, 'credit', e.target.value)}
                  className=" border w-28  rounded px-2 py-3 text-right text-black"
                  placeholder="0"
                />
              </td>

             
            </tr>
          ))}
          <tr className="bg-gray-50 border-t font-semibold text-black">
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
