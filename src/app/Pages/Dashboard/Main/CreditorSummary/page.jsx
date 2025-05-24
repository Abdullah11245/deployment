'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';
function Receiptreport() {
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [includedSuppliers, setIncludedSuppliers] = useState([]);
  const [excludedSuppliers, setExcludedSuppliers] = useState([]);
  const [includedRoutes, setIncludedRoutes] = useState([]);
  const [excludedRoutes, setExcludedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]); // original unfiltered data
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch suppliers
        const suppliersRes = await axios.get('https://accounts-management.onrender.com/common/suppliers/getAll');
        const suppliers = suppliersRes.data.suppliers || [];

        setSupplierOptions(suppliers.map(s => ({ value: s.supplier_code, label: s.name })));

        const routesSet = new Set();
        const routeMap = {};

        suppliers.forEach(supplier => {
          const routeName = supplier.route?.name || 'N/A';
          routesSet.add(routeName);
          routeMap[supplier.supplier_code] = routeName;
        });

        setRouteOptions(Array.from(routesSet).map(route => ({ label: route, value: route })));
setAllSuppliers(suppliers); // store full list for reset/reference
setFilteredSuppliers(suppliers); // display initially

        // ✅ Fetch voucher details for each supplier in batches
        const fetchVoucherDetailsInBatches = async (suppliers, batchSize = 50) => {
          const allVoucherDetails = [];

          // Process suppliers in batches
          for (let i = 0; i < suppliers.length; i += batchSize) {
            const batch = suppliers.slice(i, i + batchSize);

            // Send requests for this batch in parallel
            const results = await Promise.allSettled(
              batch.map(supplier =>
                axios.get(`https://accounts-management.onrender.com/common/voucherDetail/mains/${supplier.supplier_code}`)
              )
            );

            // Handle successful and failed responses
            results.forEach((result, index) => {
              if (result.status === 'fulfilled' && Array.isArray(result.value.data)) {
                allVoucherDetails.push(...result.value.data);
              } else {
                const failedSupplier = batch[index];
                console.error(`Failed to fetch voucher details for supplier ${failedSupplier.supplier_code}:`, result.reason);
              }
            });
          }

          return allVoucherDetails;
        };

        // Fetch all voucher details in batches
        const allVoucherDetails = await fetchVoucherDetailsInBatches(suppliers);
        setVoucherDetails(allVoucherDetails);
        console.log(allVoucherDetails);

        // ✅ Fetch all vouchers
        const voucherRes = await axios.get(`https://accounts-management.onrender.com/common/voucher/getAll`);
        setVouchers(voucherRes.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get the latest JV voucher details for a given account_code
  const getJVParticulars = (accountCode) => {
    // Filter vouchers by account_code and type 'JV'
    const filteredVouchers = voucherDetails.filter(voucher => voucher.account_code === accountCode );
    // Sort the filtered vouchers by main_id (or another date field) in descending order to get the latest voucher
    const sortedVouchers = filteredVouchers.sort((a, b) => b.main_id - a.main_id);
    return sortedVouchers[0]?.particulars || ''; // Return particulars of the latest JV voucher or a default message
  };

  const handleSearch = () => {
    const includedSupplierIds = includedSuppliers.map(s => s.value);
    const excludedSupplierIds = excludedSuppliers.map(s => s.value);
    const includedRouteNames = includedRoutes.map(r => r.value);
    const excludedRouteNames = excludedRoutes.map(r => r.value);

    const filtered = allSuppliers.filter(supplier => {
      const routeName = supplier.route?.name || 'N/A';
      const supplierIncluded = includedSupplierIds.length === 0 || includedSupplierIds.includes(supplier.supplier_code);
      const supplierExcluded = excludedSupplierIds.length === 0 || !excludedSupplierIds.includes(supplier.supplier_code);
      const routeIncluded = includedRouteNames.length === 0 || includedRouteNames.includes(routeName);
      const routeExcluded = excludedRouteNames.length === 0 || !excludedRouteNames.includes(routeName);

      return supplierIncluded && supplierExcluded && routeIncluded && routeExcluded;
    });

    setFilteredSuppliers(filtered);
  };

const handleReset = () => {
  setIncludedSuppliers([]);
  setExcludedSuppliers([]);
  setIncludedRoutes([]);
  setExcludedRoutes([]);
  setFilteredSuppliers(allSuppliers); // restore original list
};

const getLastPaidJV = (accountCode) => {
  const jvWithDebit = voucherDetails
    .filter(v => v.account_code === accountCode && v.voucher_type === 'JV' && Number(v.debit) > 0)
    

  if (jvWithDebit.length > 0) {
    const latest = jvWithDebit[0];
    return {
      amount: latest.debit,
      particulars: latest.particulars,
      voucher_number: latest.voucher_number || 'N/A',
    };
  }

  return null;
};
const getCurrentBalance = (accountCode) => {
  const entries = voucherDetails.filter(v => v.account_code === accountCode);
   console.log(entries)
  const totalDebit = entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

  return totalDebit - totalCredit;
};
const tableRef = useRef();
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(
    filteredSuppliers.map((supplier, idx) => ({
      '#': idx + 1,
      'Route': supplier.route?.name || 'N/A',
      'Supplier': supplier.name,
      'Particulars': getJVParticulars(supplier.supplier_code),
      'Amount': getCurrentBalance(supplier.supplier_code),
      'Status': getCurrentBalance(supplier.supplier_code) < 0 ? 'Cr' : 'Dr'
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');
  XLSX.writeFile(wb, 'Supplier_Report.xlsx');
};

const exportToPDF = () => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['#', 'Route', 'Supplier', 'Particulars', 'Amount', 'Status']],
    body: filteredSuppliers.map((supplier, idx) => [
      idx + 1,
      supplier.route?.name || 'N/A',
      supplier.name,
      getJVParticulars(supplier.supplier_code),
      getCurrentBalance(supplier.supplier_code),
      getCurrentBalance(supplier.supplier_code) < 0 ? 'Cr' : 'Dr'
    ])
  });
  doc.save('Supplier_Report.pdf');
};

const handlePrint = () => {
  const headerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Creditor Summary</h2>
      <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  const tableHTML = tableRef.current?.outerHTML || '<p>No data available</p>';
  const printWindow = window.open('', '', 'width=900,height=650');

  printWindow.document.write(`
    <html>
      <head>
        <title>Creditor Final Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 13px;
          }
          th, td {
            padding: 8px 12px;
            border: 1px solid #333;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
          }
          thead {
            background-color: #f3f4f6;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          h2, p {
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${headerHTML}
        ${tableHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


const exportToCSV = () => {
  const ws = XLSX.utils.json_to_sheet(
    filteredSuppliers.map((supplier, idx) => ({
      '#': idx + 1,
      'Route': supplier.route?.name ,
      'Supplier': supplier.name,
      'Particulars': getJVParticulars(supplier.supplier_code),
      'Amount': getCurrentBalance(supplier.supplier_code),
      'Status': getCurrentBalance(supplier.supplier_code) < 0 ? 'Cr' : 'Dr'
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');

  // Export as CSV
  XLSX.writeFile(wb, 'Supplier_Report.csv', { bookType: 'csv' });
};
const handleBarSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // If the search query is empty, reset to show all suppliers
    if (!query) {
        setFilteredSuppliers(allSuppliers); // Show all suppliers
    } else {
        // Filter the suppliers based on the search query
        const filtered = filteredSuppliers.filter((supplier) => {
            return (
                supplier.route?.name.toLowerCase().includes(query) || 
                supplier.name.toLowerCase().includes(query) ||
                getJVParticulars(supplier.supplier_code)?.toLowerCase().includes(query) ||
                getCurrentBalance(supplier.supplier_code).toString().toLowerCase().includes(query) ||
                (getLastPaidJV(supplier.supplier_code)?.amount.toString().toLowerCase().includes(query)) ||
                (getCurrentBalance(supplier.supplier_code) < 0 ? 'Cr' : 'Dr').toLowerCase().includes(query)
            );
        });

        setFilteredSuppliers(filtered); // Update filtered data based on search
    }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Supplier Route Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium ">Included Suppliers</label>
          <Select className='mt-2' isMulti options={supplierOptions} value={includedSuppliers} onChange={setIncludedSuppliers} />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Suppliers</label>
          <Select className='mt-2' isMulti options={supplierOptions} value={excludedSuppliers} onChange={setExcludedSuppliers} />
        </div>
        <div>
          <label className="text-sm font-medium">Included Routes</label>
          <Select className='mt-2' isMulti options={routeOptions} value={includedRoutes} onChange={setIncludedRoutes} />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Routes</label>
          <Select className='mt-2' isMulti options={routeOptions} value={excludedRoutes} onChange={setExcludedRoutes} />
        </div>
      </div>

      <div className="mt-4">
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        <button onClick={handleReset} className="ml-2 bg-red-600 text-white px-4 py-2 rounded">Reset</button>
      </div>

      <div className="overflow-x-auto mt-6 bg-white shadow-md rounded">
          <div className='flex justify-between items-center mb-4'>
<div className="mt-6 flex flex-wrap gap-2">
  <button onClick={exportToExcel} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Export Excel</button>
  <button onClick={exportToPDF} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Export PDF</button>
  <button onClick={handlePrint} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Print</button>
  <button onClick={exportToCSV} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Export CSV</button>

</div>
<div className="mt-6 ">
        <input
          type="text"
          value={searchQuery}
          onChange={handleBarSearch}
          placeholder="Search..."
          className="px-4 py-2 border rounded-md w-full"
        />
      </div>
        </div>
        <table ref={tableRef} className="min-w-full table-auto">
          <thead className="bg-gray-100 text-sm font-semibold text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Particulars</th>
              <th className="px-4 py-2"> Amount</th>
              <th className='px-4 py-2'>Status</th>

            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredSuppliers.map((supplier, idx) => {
              const jvParticulars = getJVParticulars(supplier.supplier_code);
              const latestJVVoucher = voucherDetails.find(v => v.account_code === supplier.supplier_code );

             const lastPaid = getLastPaidJV(supplier.supplier_code);
             const balance = getCurrentBalance(supplier.supplier_code);
              return (
                <tr key={supplier.supplier_code} className="border-b">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{supplier.route?.name || 'N/A'}</td>
<td className="px-4 py-2">
  <Link
    className='text-blue-600'
    href={`/Pages/Dashboard/Ledger/${supplier.supplier_code}`}
  >
    {supplier.name}
  </Link>
</td>
                  <td className="px-4 py-2 w-44">{jvParticulars}</td>
                 
                 <td className="px-4 py-2 font-medium">{balance.toLocaleString()}</td>
                 <td className="px-4 py-2 font-medium">
 {balance < 0 ? 'Cr' : 'Dr'}
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Receiptreport;
