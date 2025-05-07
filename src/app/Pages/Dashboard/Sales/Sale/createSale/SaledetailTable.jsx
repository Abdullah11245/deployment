'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const SaleDetailTable = ({
  saleDetails = [],
  setSaleDetails,
  taxPercentage = 0,
  taxAmount = 0,
  setGrandTotal,
  setTaxPercentage, // ✅ Add this

}) => {
  const [items, setItems] = useState([]);

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

  // Initialize with one default row if empty
  useEffect(() => {
    if (saleDetails.length === 0) {
      setSaleDetails([
        {
          itemId: '',
          itemLabel: '',
          vehicleNo: '',
          frieght: '',
          uom: '',
          weight: '',
          rate: '',
          adjustment: '',
          total: 0,
          taxPercentage,
        },
      ]);
    }
  }, []); // Runs only on mount

  const handleInputChange = (index, field, value) => {
    const updated = [...saleDetails];
    updated[index] = {
      ...updated[index],
      [field]: field === 'itemId' ? value.value : value,
      itemLabel: field === 'itemId' ? value.label : updated[index]?.itemLabel,
    };
    setSaleDetails(updated);
  };

  const calculateTotal = (detail) => {
    const weight = parseFloat(detail.weight) || 0;
    const rate = parseFloat(detail.rate) || 0;
    const adjustment = parseFloat(detail.adjustment) || 0;
    const Freight =parseFloat(detail.frieght) || 0
    return weight * rate + adjustment -Freight ;
  };

  const subtotal = saleDetails.reduce((acc, detail) => acc + calculateTotal(detail), 0);
  const grandTotal = subtotal + (parseFloat(taxAmount) || 0);

  useEffect(() => {
    if (setGrandTotal) {
      setGrandTotal(grandTotal);
    }
  }, [saleDetails, taxAmount]);
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
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
          {saleDetails.map((detail, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>

              <td className="px-4 py-2 w-48">
                <Select
                  options={items}
                  value={items.find(item => item.value === detail.itemId) || null}
                  onChange={(val) => handleInputChange(index, 'itemId', val)}
                  placeholder="Select Item"
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  value={detail?.vehicleNo}
                  placeholder='Vehicle'
                  onChange={(e) => handleInputChange(index, 'vehicleNo', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Frieght'
                  value={detail?.frieght}
                  onChange={(e) => handleInputChange(index, 'frieght', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='UOM'
                  value={detail?.uom}
                  onChange={(e) => handleInputChange(index, 'uom', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Weight'
                  value={detail?.weight}
                  onChange={(e) => handleInputChange(index, 'weight', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-24"
                  placeholder='Rate'
                  value={detail?.rate}
                  onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="text"
                  className="border rounded px-2 py-2 w-28"
                  placeholder='Adjustment'
                  value={detail?.adjustment}
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
