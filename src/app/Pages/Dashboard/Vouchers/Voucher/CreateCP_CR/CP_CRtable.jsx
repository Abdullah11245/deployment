'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const VoucherDetailTable = ({ voucherDetails, setVoucherDetails, voucherType }) => {
  const [accounts, setAccounts] = useState([]); // To store either suppliers or customers
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  // Fetch suppliers or customers based on voucher type
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let url = '';
        if (voucherType === 'CP') {
          url = 'https://accounts-management.onrender.com/common/suppliers/getAll';
        } else if (voucherType === 'CR') {
          url = 'https://accounts-management.onrender.com/common/parties/getAll';
        }
  
        if (url) {
          const response = await fetch(url);
          const data = await response.json();
  
          // Normalize response into a common shape: { code, name }
          let normalized = [];
  
          if (voucherType === 'CP' && data?.suppliers) {
            normalized = data.suppliers.map((s) => ({
              code: s.supplier_code,
              name: s.name,
            }));
          } else if (voucherType === 'CR' && data) {
            normalized = data.map((c) => ({
              code: c.party_code,
              name: c.name,
            }));
          
          }
  
          setAccounts(normalized);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
  
    fetchAccounts();
  }, [voucherType]);
   // Re-run the effect when voucherType changes

  const handleInputChange = (index, field, value,field2,label) => {
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
    options={accounts.map((account) => ({
      value: account.code,
      label: account.name,
    }))}
    value={
      row.account_code
        ? {
            value: row.account_code,
            label: accounts.find((a) => a.code === row.account_code)?.name || '',
          }
        : null
    }
    onChange={(selected) => handleInputChange(index, 'account_code', selected?.value ,'title',selected.label|| '')}
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

              {/* Conditionally render Debit or Credit column based on voucher type */}
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

          {/* Summary row */}
          <tr className="bg-gray-50 border-t font-semibold">
            <td colSpan="3" className="px-4 py-2 text-right">Totals</td>
            <td className="px-4 py-2 text-right">{formatCurrencyPK(totalDebit.toFixed(2))}</td>
            <td className="px-4 py-2 text-right">{formatCurrencyPK(totalCredit.toFixed(2))}</td>
            <td />
          </tr>
        </tbody>
      </table>

      {/* Add Row Button */}
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
