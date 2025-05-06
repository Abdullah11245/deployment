'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const SaleDetailTable = ({
  saleDetails = [],
  setSaleDetails,
  taxPercentage = 0,
  taxAmount = 0,
  setGrandTotal,
}) => {
  const [items, setItems] = useState([]);

  // Normalize saleDetails to ensure it's always an array
  const normalizedDetails = Array.isArray(saleDetails) ? saleDetails : [saleDetails];

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://accounts-management.onrender.com/common/items/getAll');
        const data = await response.json();

        const saleItems = data
          .filter(item => item.type === 'Sale')
          .map(item => ({
            value: item.id,
            label: item.name,
          }));

        setItems(saleItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updated = [...normalizedDetails];
    const updatedItem = {
      ...updated[index],
      [field]: field === 'item_id' ? value.value : value,
    };
  
    if (field === 'item_id') {
      updatedItem.itemLabel = value.label;
    }
  
    updated[index] = updatedItem;
    setSaleDetails(updated);
  };
  
  

  const calculateTotal = (detail) => {
    const weight = parseFloat(detail.weight) || 0;
    const rate = parseFloat(detail.rate) || 0;
    const adjustment = parseFloat(detail.adjustment) || 0;
    return weight * rate + adjustment;
  };

  const subtotal = normalizedDetails.reduce((acc, detail) => acc + calculateTotal(detail), 0);
  const grandTotal = subtotal + (parseFloat(taxAmount) || 0);

  useEffect(() => {
    if (setGrandTotal) {
      setGrandTotal(grandTotal);
    }
  }, [normalizedDetails, taxAmount]);

  const addRow = () => {
    setSaleDetails([
      ...normalizedDetails,
      {
        item_id: '',
        itemLabel: '',
        vehicle_no: '',
        frieght: '',
        uom: '',
        weight: '',
        rate: '',
        adjustment: '',
        total: 0,
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...normalizedDetails];
    updated.splice(index, 1);
    setSaleDetails(updated);
  };


  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Vehicle No</th>
            <th className="px-4 py-2">Freight</th>
            <th className="px-4 py-2">UOM</th>
            <th className="px-4 py-2">Weight</th>
            <th className="px-4 py-2">Rate</th>
            <th className="px-4 py-2">Adjustment</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {normalizedDetails.map((detail, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>

              <td className="px-4 py-2 w-48">
                <Select
                  options={items}
                  value={items.find(item => item.value === detail.item_id) || null}
                  onChange={(val) => handleInputChange(index, 'itemId', val)}
                  placeholder="Select Item"
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-24"
                  value={detail?.vehicle_no}
                  onChange={(e) => handleInputChange(index, 'vehicleNo', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.frieght}
                  onChange={(e) => handleInputChange(index, 'frieght', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.uom}
                  onChange={(e) => handleInputChange(index, 'uom', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.weight}
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.rate}
                  onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.adjustment}
                  onChange={(e) => handleInputChange(index, 'adjustment', e.target.value)}
                />
              </td>

              <td className="px-4 py-2 text-right font-semibold">
                {calculateTotal(detail).toFixed(2)}
              </td>

              <td className="px-4 py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {/* Summary Rows */}
          <tr className="bg-gray-50 border-t">
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">Subtotal</td>
            <td className="text-right px-4 py-2 font-bold">{subtotal.toFixed(2)}</td>
            <td />
          </tr>
          <tr className="bg-gray-50 border-t">
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">
              Tax ({parseFloat(taxPercentage) || 0}%)
            </td>
            <td className="text-right px-4 py-2 font-bold">{parseFloat(taxAmount || 0).toFixed(2)}</td>
            <td />
          </tr>
          <tr className="bg-gray-200 border-t">
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">Total</td>
            <td className="text-right px-4 py-2 font-bold text-blue-600">{grandTotal.toFixed(2)}</td>
            <td />
          </tr>
        </tbody>
      </table>

      {/* Add Row Button */}
      <div className="mt-4 px-4 mb-4 flex justify-end">
        <button
          type="button"
          onClick={addRow}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add row
        </button>
      </div>
    </div>
  );
};

export default SaleDetailTable;
