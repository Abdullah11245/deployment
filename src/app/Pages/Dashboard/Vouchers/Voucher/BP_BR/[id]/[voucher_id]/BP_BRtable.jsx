'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const VoucherDetailTable = ({ voucherDetails, setVoucherDetails, voucherType }) => {
  const [mainOptions, setMainOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const initials = [
          { account_title: 'Cash', account_code: '1110001' },
          { account_title: "Sales Tax ()", account_code: "2120001" },
          { account_title: "Adjusted Balances ()", account_code: "5110001" },
          { account_title: "Inventory", account_code: "1140001" },
          { account_title: 'Deduction of W.H.T by Azhar Corp. (Pvt.) Ltd.', account_code: '1150001' },
          { account_title: "Deduction of W.H.T by Salva Feed (Pvt.) Ltd. ", account_code: '1150002' },
          { account_title: "Deduction of W.H.T by Sadiq Feed (Pvt.) Ltd.", account_code: "1150003" }
        ];

        const [bankRes, partyRes, supplierRes] = await Promise.all([
          fetch('https://accounts-management.onrender.com/common/banks/getAll'),
          fetch('https://accounts-management.onrender.com/common/parties/getAll'),
          fetch('https://accounts-management.onrender.com/common/suppliers/getAll')
        ]);

        const banks = await bankRes.json();
        const parties = await partyRes.json();
        const suppliersData = await supplierRes.json();
        const suppliers = suppliersData.suppliers;

        const bankMapped = banks.map(b => ({
          label: b.account_title,
          value: b.account_code,
          type: 'bank'
        }));

        const partyMapped = parties.map(p => ({
          label: p.name,
          value: p.party_code,
          type: 'party'
        }));

        const supplierMapped = suppliers.map(s => ({
          label: s.name,
          value: s.supplier_code,
          type: 'supplier'
        }));

        const initialMapped = initials.map(i => ({
          label: i.account_title,
          value: i.account_code,
          type: 'initial'
        }));

        const combined = [
          ...bankMapped,
          ...partyMapped,
          ...supplierMapped,
          ...initialMapped
        ];

        // Optionally group them visually
        const grouped = [
          { label: 'Banks', options: bankMapped },
          { label: 'Parties', options: partyMapped },
          { label: 'Suppliers', options: supplierMapped },
          { label: 'Initial Accounts', options: initialMapped }
        ];

        setMainOptions(grouped);
        setBankOptions(grouped);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchOptions();
  }, [voucherType]);

  const handleInputChange = (index, field, value, type) => {
    setVoucherDetails((prevDetails) => {
      const updated = [...prevDetails];
      const currentRow = { ...updated[index] };

      const flatOptions = [...mainOptions.flatMap(g => g.options)];

      if (field === 'account_code') {
        const selected = flatOptions.find(opt => opt.value === value && opt.type === type);
        currentRow.account_code = String(value);
        currentRow.party_name = selected?.label || '';
      } else if (field === 'bank_account_code') {
        const selectedBank = flatOptions.find(opt => opt.value === value && opt.type === type);
        currentRow.bank_account_code = String(value);
        currentRow.bank_name = selectedBank?.label || '';
      } else {
        currentRow[field] = value;
      }

      updated[index] = currentRow;
      return updated;
    });
  };

  const addRow = () => {
    setVoucherDetails([
      ...voucherDetails,
      {
        account_code: '',
        bank_account_code: '',
        particulars: '',
        debit: '',
        credit: ''
      }
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

  const getSelectedOption = (options, value) => {
    const flat = options.flatMap(g => g.options);
    return flat.find(opt => opt.value === value) || null;
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-md mt-8">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">
              {voucherType === 'BR' ? 'Account' : voucherType === 'BP' ? 'Account' : 'Account'}
            </th>
            <th className="px-4 py-2 text-left">Account</th>
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

              {/* Account Dropdown */}
              <td className="px-4 py-2 w-64">
                <Select
                  value={getSelectedOption(mainOptions, row.account_code)}
                  onChange={(selected) =>
                    handleInputChange(index, 'account_code', selected?.value || '', selected?.type)
                  }
                  options={mainOptions}
                  placeholder="Select"
                  isClearable
                />
              </td>

              {/* Bank Dropdown */}
              <td className="px-4 py-2 w-64">
                <Select
                  value={getSelectedOption(bankOptions, row.bank_account_code)}
                  onChange={(selected) =>
                    handleInputChange(index, 'bank_account_code', selected?.value || '', selected?.type)
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
                  className="w-full border rounded px-2 py-1"
                  placeholder="e.g. Payment for..."
                />
              </td>

              <td className="px-4 py-2 text-right">
                <input
                  type="number"
                  step="0.01"
                  value={row.debit}
                  onChange={(e) => handleInputChange(index, 'debit', e.target.value)}
                  className="w-24 border rounded px-2 py-1 text-right"
                  placeholder="0"
                />
              </td>

              <td className="px-4 py-2 text-right">
                <input
                  type="number"
                  step="0.01"
                  value={row.credit}
                  onChange={(e) => handleInputChange(index, 'credit', e.target.value)}
                  className="w-24 border rounded px-2 py-1 text-right"
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
            <td className="px-4 py-2 text-right">{totalDebit.toFixed(2)}</td>
            <td className="px-4 py-2 text-right">{totalCredit.toFixed(2)}</td>
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
