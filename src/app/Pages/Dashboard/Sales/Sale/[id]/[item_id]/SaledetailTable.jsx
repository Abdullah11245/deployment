'use client';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

const SaleDetailTable = ({
  saleDetails = [],
  setSaleDetails,
  taxPercentage = 0,
  taxAmount = 0,
}) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/items/getAll');
        const options = response?.data?.map(item => ({
          value: item.id,
          label: item.name
        })) || [];
        setItems(options);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updated = [...saleDetails];
    updated[index] = {
      ...updated[index],
      [field]: field === 'itemId' ? value.value : value,
      itemLabel: field === 'itemId' ? value.label : updated[index]?.itemLabel
    };
    setSaleDetails(updated);
  };

  const calculateTotal = (detail) => {
    const weight = parseFloat(detail.weight) || 0;
    const rate = parseFloat(detail.rate) || 0;
    const adjustment = parseFloat(detail.adjustment) || 0;
    return weight * rate + adjustment;
  };

  const subtotal = saleDetails.reduce((acc, detail) => acc + calculateTotal(detail), 0);
  const grandTotal = subtotal + parseFloat(taxAmount || 0);

  const addRow = () => {
    setSaleDetails([
      ...saleDetails,
      {
        itemId: '',
        itemLabel: '',
        vehicleNo: '',
        frieght: '',
        uom: '',
        weight: '',
        rate: '',
        adjustment: ''
      }
    ]);
  };

  const removeRow = (index) => {
    const updated = [...saleDetails];
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
          {saleDetails.map((detail, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>

              {/* Item Dropdown */}
              <td className="px-4 py-2 w-48">
                <Select
                  options={items}
                  value={items.find(item => item.value === detail.itemId) || null}
                  onChange={(val) => handleInputChange(index, 'itemId', val)}
                  placeholder="Select Item"
                />
              </td>

              {/* Vehicle No */}
              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-24"
                  value={detail?.vehicleNo}
                  onChange={(e) => handleInputChange(index, 'vehicleNo', e.target.value)}
                />
              </td>

              {/* Freight */}
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.frieght}
                  onChange={(e) => handleInputChange(index, 'frieght', e.target.value)}
                />
              </td>

              {/* UOM */}
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.uom}
                  onChange={(e) => handleInputChange(index, 'uom', e.target.value)}
                />
              </td>

              {/* Weight */}
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.weight}
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                />
              </td>

              {/* Rate */}
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.rate}
                  onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                />
              </td>

              {/* Adjustment */}
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={detail?.adjustment}
                  onChange={(e) => handleInputChange(index, 'adjustment', e.target.value)}
                />
              </td>

              {/* Total */}
              <td className="px-4 py-2 text-right font-semibold">
                {calculateTotal(detail).toFixed(2)}
              </td>

              {/* Remove Button */}
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
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">Grand Total</td>
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
