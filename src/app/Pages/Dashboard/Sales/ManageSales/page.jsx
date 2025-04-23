'use client'
import React, { useState } from 'react';

function Receiptreport() {
  const [activeRow, setActiveRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const [routes, setRoutes] = useState([
    {
      id: 1,
      item: '',
      vehicleNumber: 'V001',
      freight: '$100',
      uom: 'KG',
      weight: 200,
      rate: '$5',
      adj: '$0',
      total: '$1000',
    },
   
    // Add more rows as needed
  ]);

  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  const handleCreateNew = () => {
    alert('Create New Route');
  };

  const handleItemChange = (id, value) => {
    setRoutes((prevRoutes) =>
      prevRoutes.map((route) =>
        route.id === id ? { ...route, item: value } : route
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Create New Button */}
     
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">New Voucher</h2>
      </div>

      {/* Dropdowns and Date Pickers */}
      <div className='mt-8 mb-8 flex items-center space-x-2'>
        <p className=' font-semibold'>ID:</p>
       <div className='border-gray-500 border-2 w-20 h-8 rounded-md bg-gray-200'></div>
      </div>
      <div className="flex space-x-4 mt-4">
        {/* Start Date Picker */}
        <div className="flex-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-900">Voucher Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

       
       
        <div className="flex-1">
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-900">Voucher Type</label>
          <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="w-full px-4 py-2 border rounded-md mt-2"
          >
            <option value="" disabled>Select an option</option>
            <option value="VR001">VR001</option>
            <option value="VR002">VR002</option>
            <option value="VR003">VR003</option>
            <option value="VR004">VR004</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-8">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Freight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (KG)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adj.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, index) => (
              <tr key={route.id} className="border-t">
                <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <select
                    value={route.item}
                    onChange={(e) => handleItemChange(route.id, e.target.value)}
                    className="w-24 px-4 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select Item</option>
                    {items.map((item, idx) => (
                      <option key={idx} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
                <td className="px-6 py-4 text-sm text-gray-700"><input type="text" className='w-20 h-8 border rounded px-2' /></td>
              </tr>
            ))}
          </tbody>
       

        </table>
        <div className='flex px-4'>
  <div className='border flex-[4] py-1 font-semibold text-sm text-right px-2'>Sub Total</div>
  <div className='border flex-[1] py-1 text-right px-6'>0</div>
</div>
<div className='flex px-4'>
  <div className='border flex-[4] py-1 text-right px-2'><span className='mr-1 font-semibold px-2 text-sm'> Tax (%)</span><input type="text" className='w-20 h-6 border rounded px-2' /></div>
  <div className='border flex-[1] py-1 text-right px-6'>0</div>
</div>
<div className='flex px-4'>
  <div className='border flex-[4] py-1 text-right font-semibold px-2 text-sm'>Total</div>
  <div className='border flex-[1] py-1 text-right px-6'>0</div>
</div>
<div className='mt-8 px-4'>
  <p className='text-base font-semibold mb-2'>Notes</p>
<textarea
  id="textarea-email-label"
  className="py-3 px-4 block w-64 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  rows="5"
  placeholder="Notes..."
></textarea>
</div>

        
          <div className="flex justify-between items-center mt-8 mb-4 px-4">
          <div className="flex space-x-1">
            <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
              Save
            </button>
  
            <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
              Add New
            </button>
  
            <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
              Preview
            </button>
  
            <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
              Print
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-white border-2  text-gray-500 text-sm font-medium rounded-md">
              Cancel
            </button>
          </div>
  
          {/* Search Box */}
          <div className="relative text-gray-600 border-2 rounded-full">
           
          </div>
        </div>
      </div>

      {/* Pagination and Entry Count */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, routes.length)} of {routes.length} entries
        </div>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-400"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-400"
            onClick={() => setCurrentPage(Math.min(Math.ceil(routes.length / 10), currentPage + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Receiptreport;
