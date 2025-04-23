'use client';
import React, { useEffect } from 'react';

const SupplierTable = ({ supplier = [], supplierInputs = [], setSupplierInputs }) => {
  console.log('Supplier Inputs:', supplierInputs);

  // Ensure supplierInputs is initialized when supplier changes
  useEffect(() => {
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
    // Copy the current state
    const updated = [...supplierInputs];

    // Update the field value for the given index
    updated[index][field] = value;

    // Calculate the amount (qty_mann * rate)
    const qty_mann = parseFloat(updated[index]?.qty_mann) || 0;
    const rate = parseFloat(updated[index]?.rate) || 0;
    updated[index].amount = qty_mann * rate;

    // Update the state with the new values
    setSupplierInputs(updated);
  };

  const totalAmount = supplierInputs.reduce(
    (sum, item) => sum + (parseFloat(item?.amount) || 0),
    0
  );

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
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
            const input = supplierInputs[index] || {}; // Fallback to avoid crash

            return (
              <tr key={s?.id || index} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{s?.name} - {s?.address}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={input.qty_kg || ''}
                    onChange={(e) => handleInputChange(index, 'qty_kg', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={input.qty_mann || ''}
                    onChange={(e) => handleInputChange(index, 'qty_mann', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={input.rate || ''}
                    onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">{input.amount || 0}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-32"
                    value={input.note || ''}
                    onChange={(e) => handleInputChange(index, 'note', e.target.value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan="5" className="text-right px-4 py-2">Total:</td>
            <td className="px-4 py-2">{totalAmount}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SupplierTable;
