'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import end_points from '../../../../../../../api_url';

const VoucherDetailTable = ({ voucherDetails, setVoucherDetails, voucherType }) => {
  const [accountOptions, setAccountOptions] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
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
          fetch(`${end_points}/banks/getAll`),
          fetch(`${end_points}/parties/getAll`),
          fetch(`${end_points}/suppliers/getAll`),
        ]);

        const banks = await bankRes.json();
        const parties = await partyRes.json();
        const supplierData = await supplierRes.json();
        const suppliers = supplierData?.suppliers || [];

        const bankOptions = banks.map(b => ({
          label: b.account_title,
          value: b.account_code,
        }));

        const partyOptions = parties.map(p => ({
          label: p.name,
          value: p.party_code,
        }));

        const supplierOptions = suppliers.map(s => ({
          label: s.name,
          value: s.supplier_code,
        }));

        const initialOptions = initials.map(i => ({
          label: i.account_title,
          value: i.account_code,
        }));

        const grouped = [
          { label: 'Banks', options: bankOptions },
          { label: 'Parties', options: partyOptions },
          { label: 'Suppliers', options: supplierOptions },
          { label: 'Initial Accounts', options: initialOptions },
        ];

        setAccountOptions(grouped);
      } catch (error) {
        console.error('Error fetching account options:', error);
      }
    };

    fetchAccounts();
  }, []);

  const handleInputChange = (index, field, value, field2, label) => {
    const updated = [...voucherDetails];
    updated[index] = {
      ...updated[index],
      [field]: value,
      [field2]: label,
    };
    setVoucherDetails(updated);
  };

  const addRow = () => {
    setVoucherDetails([
      ...voucherDetails,
      {
        account_code: '',
        title: '',
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
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Account Code</th>
            <th className="px-4 py-2 text-left">Particulars</th>
            {voucherType === 'CP' ? (
              <th className="px-4 py-2 text-right">Debit</th>
            ) : voucherType === 'CR' ? (
              <th className="px-4 py-2 text-right">Credit</th>
            ) : (
              <>
                <th className="px-4 py-2 text-right">Debit</th>
                <th className="px-4 py-2 text-right">Credit</th>
              </>
            )}
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {voucherDetails.map((row, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>

              <td className="px-4 py-2">
                <Select
                  className="w-full"
                  options={accountOptions}
                  value={
                    row.account_code
                      ? {
                          value: row.account_code,
                          label:
                            accountOptions
                              .flatMap(group => group.options)
                              .find(opt => opt.value === row.account_code)?.label || '',
                        }
                      : null
                  }
                  onChange={(selected) =>
                    handleInputChange(index, 'account_code', selected?.value, 'title', selected?.label || '')
                  }
                  placeholder="Select Account"
                  isClearable
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.particulars}
                  onChange={(e) => handleInputChange(index, 'particulars', e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="e.g. Purchase of materials"
                />
              </td>

              {voucherType === 'CP' ? (
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
              ) : voucherType === 'CR' ? (
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
              ) : (
                <>
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
                </>
              )}

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
            <td colSpan="3" className="px-4 py-2 text-right">Totals</td>
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
