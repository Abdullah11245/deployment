'use client';
import React, { useState, useEffect } from 'react';

const VoucherDetailTable = ({ voucherDetails, setVoucherDetails }) => {
  const [banks, setBanks] = useState([]);

  // Fetch the list of banks when the component mounts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('https://accounts-management.onrender.com/common/parties/getAll');
        const data = await response.json();
        setBanks(data); // Assuming the response is an array of bank objects
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };

    fetchBanks();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updated = [...voucherDetails];
    updated[index] = {
      ...updated[index],
      [field]: value,
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
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Account Code</th>
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

              <td className="px-4 py-2">
                <select
                  value={row.account_code}
                  onChange={(e) => handleInputChange(index, 'account_code', e.target.value)}
                  className="w-full border rounded px-2 py-2"
                >
                  <option value="">Select Account</option>
                  {banks.map((bank) => (
                    <option key={bank.party_code} value={bank.party_code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
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

          {/* Summary row */}
          <tr className="bg-gray-50 border-t font-semibold">
            <td colSpan="3" className="px-4 py-2 text-right">Totals</td>
            <td className="px-4 py-2 text-right">{totalDebit.toFixed(2)}</td>
            <td className="px-4 py-2 text-right">{totalCredit.toFixed(2)}</td>
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
