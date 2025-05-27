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

  // Fetch and group all accounts (banks, suppliers, parties, initials)
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
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
        <thead className="bg-gray-500 text-white">
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
                              .flatMap((group) => group.options)
                              .find((opt) => opt.value === row.account_code)?.label || '',
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
                  className="w-full border rounded px-2 py-3"
                  placeholder="e.g. Purchase of materials"
                />
              </td>

              {voucherType === 'CP' ? (
                <td className="px-4 py-2 text-right">
                  <input
                    type="text"
                    value={row.debit}
                    onChange={(e) => handleInputChange(index, 'debit', e.target.value)}
                    className="w-32 border rounded px-2 py-3 text-right"
                    placeholder="0"
                  />
                </td>
              ) : voucherType === 'CR' ? (
                <td className="px-4 py-2 text-right">
                  <input
                    type="text"
                    value={row.credit}
                    onChange={(e) => handleInputChange(index, 'credit', e.target.value)}
                    className="w-32 border rounded px-2 py-3 text-right"
                    placeholder="0"
                  />
                </td>
              ) : (
                <>
                  <td className="px-4 py-2 text-right">
                    <input
                      type="text"
                      value={row.debit}
                      onChange={(e) => handleInputChange(index, 'debit', e.target.value)}
                      className="w-32 border rounded px-2 py-3 text-right"
                      placeholder="0"
                    />
                  </td>

                  <td className="px-4 py-2 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={row.credit}
                      onChange={(e) => handleInputChange(index, 'credit', e.target.value)}
                      className="w-32 border rounded px-2 py-3 text-right"
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
