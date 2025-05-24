'use client';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierPurchaseDetails, setSupplierPurchaseDetails] = useState({});
  const tableRef = useRef();

const extractWeightAndMonth = (particulars) => {
  if (typeof particulars !== 'string') return null;

  console.log('Original Particulars:', particulars);

  // Updated regex to allow prefix before the weight@rate
  const match = particulars.match(/.*?(\d+(?:\.\d+)?)@\d+\/-\s*\(\s*(\w{3})-(\d{4})\s*\)/);

  if (!match) {
    console.warn('No match found for particulars:', particulars);
    return null;
  }

  const weight = parseFloat(match[1]);
  const month = match[2];
  const year = match[3];

  const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1;
  const monthKey = `${year}-${String(monthNumber).padStart(2, '0')}`;

  console.log('Parsed Weight:', weight);
  console.log('Parsed MonthKey:', monthKey);

  return { weight, monthKey };
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersRes = await axios.get('https://accounts-management.onrender.com/common/suppliers/getAll');
        const suppliers = suppliersRes.data.suppliers || [];

        setSupplierOptions(suppliers.map(s => ({ value: s.supplier_code, label: s.name })));
        const routesSet = new Set();
        suppliers.forEach(s => routesSet.add(s.route?.name || 'N/A'));
        setRouteOptions(Array.from(routesSet).map(r => ({ label: r, value: r })));
        setAllSuppliers(suppliers);
        setFilteredSuppliers(suppliers);

        const fetchVoucherDetailsInBatches = async (suppliers, batchSize = 50) => {
          const allVoucherDetails = [];
          for (let i = 0; i < suppliers.length; i += batchSize) {
            const batch = suppliers.slice(i, i + batchSize);
            const results = await Promise.allSettled(
              batch.map(s =>
                axios.get(`https://accounts-management.onrender.com/common/voucherDetail/mains/${s.supplier_code}`)
              )
            );
            results.forEach((res, idx) => {
              if (res.status === 'fulfilled' && Array.isArray(res.value.data)) {
                allVoucherDetails.push(...res.value.data);
              } else {
                console.error(`Failed to fetch for ${batch[idx].supplier_code}`);
              }
            });
          }
          return allVoucherDetails;
        };

        const allVoucherDetails = await fetchVoucherDetailsInBatches(suppliers);
        setVoucherDetails(allVoucherDetails);

        const voucherRes = await axios.get('https://accounts-management.onrender.com/common/voucher/getAll');
        setVouchers(voucherRes.data || []);

        const calculateAverageFromParticulars = () => {
          const purchaseMap = {};
          suppliers.forEach(supplier => {
            const relevantVouchers = allVoucherDetails.filter(
              v => v.account_code === supplier.supplier_code && v.voucher_type === 'PV'
            );
          

            const monthlyWeights = new Map();
            relevantVouchers.forEach(voucher => {
              const parsed = extractWeightAndMonth(voucher.particulars);
              if (parsed) {
                const currentWeight = monthlyWeights.get(parsed.monthKey) || 0;
                monthlyWeights.set(parsed.monthKey, currentWeight + parsed.weight);
              }
            });

            const totalWeight = Array.from(monthlyWeights.values()).reduce((sum, w) => sum + w, 0);
            const months = monthlyWeights.size;
            const avgWeightPerMonth = months > 0 ? totalWeight / months : 0;

            purchaseMap[supplier.id] = {
              weight: totalWeight.toFixed(2),
              avgWeightPerMonth: avgWeightPerMonth.toFixed(2),
            };
          });

          return purchaseMap;
        };

        const purchaseMap = calculateAverageFromParticulars();
        console.log(purchaseMap)
        setSupplierPurchaseDetails(purchaseMap);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const getJVParticulars = (accountCode) => {
    const filtered = voucherDetails.filter(v => v.account_code === accountCode);
    const sorted = filtered.sort((a, b) => b.main_id - a.main_id);
    return sorted[0]?.particulars || '';
  };

  const getLastPaidJV = (accountCode) => {
    const jvs = voucherDetails.filter(v => v.account_code === accountCode && Number(v.debit) > 0).sort((a, b) => b.main_id - a.main_id);
    if (jvs.length > 0) {
      const latest = jvs[0];
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
    const totalDebit = entries.reduce((sum, e) => sum + Number(e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + Number(e.credit || 0), 0);
    return totalDebit - totalCredit;
  };

  const handleSearch = () => {
    const includedIds = includedSuppliers.map(s => s.value);
    const excludedIds = excludedSuppliers.map(s => s.value);
    const includedR = includedRoutes.map(r => r.value);
    const excludedR = excludedRoutes.map(r => r.value);

    const filtered = allSuppliers.filter(s => {
      const route = s.route?.name || 'N/A';
      const include = includedIds.length === 0 || includedIds.includes(s.supplier_code);
      const exclude = excludedIds.length === 0 || !excludedIds.includes(s.supplier_code);
      const includeRoute = includedR.length === 0 || includedR.includes(route);
      const excludeRoute = excludedR.length === 0 || !excludedR.includes(route);
      return include && exclude && includeRoute && excludeRoute;
    });

    setFilteredSuppliers(filtered);
  };

  const handleReset = () => {
    setIncludedSuppliers([]);
    setExcludedSuppliers([]);
    setIncludedRoutes([]);
    setExcludedRoutes([]);
    setFilteredSuppliers(allSuppliers);
  };

  const handleBarSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
    if (!q) return setFilteredSuppliers(allSuppliers);

    const filtered = filteredSuppliers.filter(s => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.route?.name?.toLowerCase().includes(q) ||
        getJVParticulars(s.supplier_code)?.toLowerCase().includes(q) ||
        getCurrentBalance(s.supplier_code).toString().includes(q)
      );
    });

    setFilteredSuppliers(filtered);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSuppliers.map((s, i) => ({
      '#': i + 1,
      'Route': s.route?.name || 'N/A',
      'Supplier': s.name,
      'Particulars': getJVParticulars(s.supplier_code),
      'Last Paid': getLastPaidJV(s.supplier_code)?.amount || 0,
      'Average': supplierPurchaseDetails[s.id]?.avgWeightPerMonth || '0'
,
      'Amount': getCurrentBalance(s.supplier_code),
      'Status': getCurrentBalance(s.supplier_code) < 0 ? 'Cr' : 'Dr'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');
    XLSX.writeFile(wb, 'Supplier_Report.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['#', 'Route', 'Supplier', 'Particulars', 'Last Paid', 'Average', 'Amount', 'Status']],
      body: filteredSuppliers.map((s, i) => [
        i + 1,
        s.route?.name || 'N/A',
        s.name,
        getJVParticulars(s.supplier_code),
        getLastPaidJV(s.supplier_code)?.amount || 0,
        supplierPurchaseDetails[s.id]?.avgWeightPerMonth || '0'
,
        getCurrentBalance(s.supplier_code),
        getCurrentBalance(s.supplier_code) < 0 ? 'Cr' : 'Dr'
      ])
    });
    doc.save('Supplier_Report.pdf');
  };

const handlePrint = () => {
  const headerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Creditor Final Status</h2>
      <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  const style = `
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      h2 {
        font-size: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 12px;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      @media print {
        .no-print {
          display: none;
        }
      }
    </style>
  `;

  const tableHTML = tableRef.current?.outerHTML || "<p>No data available</p>";

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Creditor Report</title>
        ${style}
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
    const ws = XLSX.utils.json_to_sheet(filteredSuppliers.map((s, i) => ({
      '#': i + 1,
      'Route': s.route?.name,
      'Supplier': s.name,
      'Particulars': getJVParticulars(s.supplier_code),
      'Last Paid': getLastPaidJV(s.supplier_code)?.amount || 0,
      'Average': supplierPurchaseDetails[s.id]?.avgWeightPerMonth || '0'
,
      'Amount': getCurrentBalance(s.supplier_code),
      'Status': getCurrentBalance(s.supplier_code) < 0 ? 'Cr' : 'Dr'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');
    XLSX.writeFile(wb, 'Supplier_Report.csv', { bookType: 'csv' });
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
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Creditor Final Status</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Included Suppliers</label>
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

      <div className="overflow-x-auto bg-white rounded shadow mt-6">
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
        <table ref={tableRef} className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Particulars</th>
              <th className="px-4 py-2">Last Paid</th>
              <th className="px-4 py-2">Average</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((s, idx) => {
              const balance = getCurrentBalance(s.supplier_code);
              return (
                <tr key={s.supplier_code} className="border-b">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{s.route?.name || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <Link href={`/Pages/Dashboard/Ledger/${s.supplier_code}`}>
                      <span className="text-blue-600">{s.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2 w-32">{getJVParticulars(s.supplier_code)}</td>
                  <td className="px-4 py-2">{getLastPaidJV(s.supplier_code)?.amount || 0}</td>
   <td className="px-4 py-2">{supplierPurchaseDetails[s.id]?.avgWeightPerMonth || '0'}</td>
                  <td className="px-4 py-2 font-semibold">{balance.toLocaleString()}</td>
                  <td className="px-4 py-2 font-semibold">{balance < 0 ? 'Cr' : 'Dr'}</td>
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
