'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import end_points from '../../../../../../../api_url';

const SaleDetailTable = ({
  saleDetails = [],
  setSaleDetails,
  taxPercentage = 0,
  taxAmount = 0,
  setGrandTotal,
  setTaxPercentage,
}) => {
  const [items, setItems] = useState([]);

  const normalizedDetails = Array.isArray(saleDetails) ? saleDetails : [saleDetails];

  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${end_points}/items/getAll`);
        const data = await response.json();
       console.log('Fetched items:', data);
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
    const fieldMap = {
      itemId: 'item_id',
      vehicleNo: 'vehicle_no',
    };

    const mappedField = fieldMap[field] || field;

    const updated = [...normalizedDetails];
    const updatedItem = {
      ...updated[index],
      [mappedField]: field === 'itemId' ? value.value : value,
    };

    if (field === 'itemId') {
      updatedItem.itemLabel = value.label;
    }

    updated[index] = updatedItem;
    setSaleDetails(updated);
  };

  const calculateTotal = (detail) => {
    const weight = parseFloat(detail.weight) || 0;
    const rate = parseFloat(detail.rate) || 0;
    const adjustment = parseFloat(detail.adjustment) || 0;
    const freight = parseFloat(detail.frieght) || 0;
    return weight * rate + adjustment - freight;
  };

  const subtotal = normalizedDetails.reduce((acc, detail) => acc + calculateTotal(detail), 0);
  const grandTotal = subtotal + (parseFloat(taxAmount) || 0);

  useEffect(() => {
    if (setGrandTotal) {
      setGrandTotal(grandTotal);
    }
  }, [normalizedDetails, taxAmount]);

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-500">
          <tr className='text-white'>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Vehicle No</th>
            <th className="px-4 py-2">Freight</th>
            <th className="px-4 py-2">UOM</th>
            <th className="px-4 py-2">Weight</th>
            <th className="px-4 py-2">Rate</th>
            <th className="px-4 py-2">Adjustment</th>
            <th className="px-4 py-2">Total</th>
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
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Vehicle'
                  value={detail?.vehicle_no || ''}
                  onChange={(e) => handleInputChange(index, 'vehicleNo', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Freight'
                  value={detail?.frieght || ''}
                  onChange={(e) => handleInputChange(index, 'frieght', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='UOM'
                  value={detail?.uom || ''}
                  onChange={(e) => handleInputChange(index, 'uom', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Weight'
                  value={detail?.weight || ''}
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Rate'
                  value={detail?.rate || ''}
                  onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-28"
                  placeholder='Adjustment'
                  value={detail?.adjustment || ''}
                  onChange={(e) => handleInputChange(index, 'adjustment', e.target.value)}
                />
              </td>

              <td className="px-4 py-2 text-right font-semibold">
                {formatCurrencyPK(calculateTotal(detail).toFixed(2))}
              </td>
            </tr>
          ))}

          <tr className="bg-gray-50 border-t">
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">Subtotal</td>
            <td className="text-right px-4 py-2 font-bold">{formatCurrencyPK(subtotal.toFixed(2))}</td>
          </tr>

          <tr className="bg-gray-50 border-t">
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">
              Tax ({parseFloat(taxPercentage) || 0}%)
            </td>
            <td className="text-right px-4 py-2">
              <input
                type="text"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="w-20 border rounded px-2 py-1 text-right"
                placeholder="0"
              />
            </td>
          </tr>

          <tr className="bg-gray-200 border-t">
            <td colSpan="8" className="text-right px-4 py-2 font-semibold">Total</td>
            <td className="text-right px-4 py-2 font-bold text-blue-600">{formatCurrencyPK(grandTotal.toFixed(2))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SaleDetailTable;
