'use client';
import React, { useEffect } from 'react';

const SupplierTable = ({ supplier = [], supplierInputs = [], setSupplierInputs }) => {
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };  useEffect(() => {
    if (supplier.length > 0 && supplierInputs.length !== supplier.length) {
      const initialInputs = supplier.map(() => ({
        qty_kg: '',
        qty_mann: '',
        rate: '',
        amount: 0,
        note: '',
      }));
      setSupplierInputs(initialInputs);
    }
  }, [supplier]);

  const handleInputChange = (index, field, value) => {
    const updated = [...supplierInputs];
    updated[index][field] = value;

    const qty = parseFloat(updated[index]?.qty_mann) || 0;
    const rate = parseFloat(updated[index]?.rate) || 0;

    if (updated[index]) {
      updated[index].amount = qty * rate;
    }

    setSupplierInputs(updated);
  };

  const totalAmount = supplierInputs.reduce((sum, input) => {
    const qty = parseFloat(input.qty_mann) || 0;
    const rate = parseFloat(input.rate) || 0;
    return sum + qty * rate;
  }, 0);
  

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-500">
          <tr className='text-white'>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Party Name & Address</th>
            <th className="px-4 py-2">Qty (کلو)</th>
            <th className="px-4 py-2">Qty (من)</th>
            <th className="px-4 py-2">Rate</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {supplier.map((s, index) => {
            const input = supplierInputs[index] || {}; // fallback to avoid crash

            return (
              <tr key={s?.id || index} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{s?.name} - {s?.address}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={input.qty_kg || ''}
                    onChange={(e) => handleInputChange(index, 'qty_kg', e?.target?.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={input.qty_mann || ''}
                    onChange={(e) => handleInputChange(index, 'qty_mann', e?.target?.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={input.rate || ''}
                    onChange={(e) => handleInputChange(index, 'rate', e?.target?.value)}
                  />
                </td>
                <td className="px-4 py-2">
  {(parseFloat(input.qty_mann || 0) * parseFloat(formatCurrencyPK(input.rate )|| 0)).toFixed(2)}
</td>                <td className="px-4 py-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-32"
                    value={input.note || ''}
                    onChange={(e) => handleInputChange(index, 'note', e?.target?.value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan="5" className="text-right px-4 py-2">Total:</td>
            <td className="px-4 py-2">{formatCurrencyPK(totalAmount)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SupplierTable;
