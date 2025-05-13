'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';
import Select from 'react-select'; // For dropdowns
import Link from 'next/link';
const numberToWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
    'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  };

  if (!num || isNaN(num)) return 'Zero Rupees Only';
  return inWords(Math.floor(num)) + ' Rupees Only';
};

function RouteList() {
  const [mergedData, setMergedData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partyOptions, setPartyOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 15;
  const tableRef = useRef(null);
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          voucherRes,
          voucherDetailRes,
          routesRes,
          partiesRes,
          supplierRes,
          banksRes,
        ] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll'),
          axios.get('https://accounts-management.onrender.com/common/routes/getAll'),
          axios.get('https://accounts-management.onrender.com/common/parties/getAll'),
          axios.get('https://accounts-management.onrender.com/common/suppliers/getAll'),
          axios.get('https://accounts-management.onrender.com/common/banks/getAll')
        ]);
        

        const vouchers = voucherRes.data || [];
        const voucherDetails = voucherDetailRes.data || [];
        const parties = partiesRes.data || [];
       const suppliers=supplierRes.data.suppliers || [];
       const banks = banksRes.data || []
        const merged = vouchers.map((voucher) => {
          const detailsForVoucher = voucherDetails.filter(
            detail => String(detail.main_id) === String(voucher.id)
          );
          return {
            ...voucher,
            details: detailsForVoucher.length ? detailsForVoucher : []
          };
        });

        setMergedData(merged);
        setOriginalData(merged);
       setPartyOptions([
  ...parties.map(p => ({
    label: p.name,
    value: p.party_code
  })),
  ...suppliers.map(s => ({
    label: s.name,
    value: s.supplier_code
  })),
  ...banks.map(b => ({
    label: b.account_title,
    value: b.account_code
  }))
]);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
useEffect(() => {
  if (!originalData.length) return;

  const filtered = originalData.filter(entry => {
    const voucherDate = new Date(entry.voucher_date);
    const dateOnly = new Date(voucherDate.toISOString().split('T')[0]);

    const isAfterStart = startDate ? dateOnly >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? dateOnly <= new Date(endDate) : true;

    const matchesDate = isAfterStart && isBeforeEnd;

    // Handle PV voucher logic
    const isPV = entry.voucher_type === 'PV';
    const shouldHidePV = selectedPartyId && isPV;

    if (shouldHidePV) return false;

    const matchesCode = accountCode
      ? entry.details.some(detail => String(detail.account_code) === String(accountCode))
      : true;

    const matchesParty = selectedPartyId
      ? entry.details.some(detail => String(detail.account_code) === String(selectedPartyId))
      : true;

    return matchesDate && matchesCode && matchesParty;
  });

  setMergedData(filtered);
  setCurrentPage(1);
}, [startDate, endDate, accountCode, selectedPartyId, originalData]);
// const getFilteredRows = () => {
//   const filteredRows = [];

//   mergedData.forEach((voucher) => {
//     voucher.details
//       .filter((detail) => {
//         const debit = parseFloat(detail.debit) || 0;
//         const credit = parseFloat(detail.credit) || 0;
//         const voucherType = voucher.voucher_type;

//         const isNonZero = debit !== 0 || credit !== 0;
//         const isValidAccount =
//           voucherType === 'PV' ? true : !["1140001", "1110001"].includes(detail.account_code);

//         if (["BR", "BP"].includes(voucherType)) {
//           return isValidAccount && credit !== 0;
//         }

//         return isValidAccount && isNonZero;
//       })
//       .forEach((detail) => {
//         const query = searchQuery.toLowerCase();
//         const matches =
//           !searchQuery.trim() ||
//           (detail.particulars || '').toLowerCase().includes(query) ||
//           String(detail.debit || '').includes(query) ||
//           String(detail.credit || '').includes(query) ||
//           (voucher.voucher_type || '').toLowerCase().includes(query) ||
//           String(voucher.voucher_id || '').toLowerCase().includes(query);

//         if (matches) {
//           filteredRows.push({ voucher, detail });
//         }
//       });
//   });

//   return filteredRows;
// };


//   const getDetailsForVoucher = (id) => {
//     const voucher = mergedData.find(v => v.id === id);
//     return voucher ? voucher.details : [];
//   };

//   const getTotalDebit = (details) => {
//     return details.reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0);
//   };

const handleSearch = () => {
  const filtered = originalData.filter(entry => {
    const voucherDate = new Date(entry.voucher_date);
    const dateOnly = new Date(voucherDate.toISOString().split('T')[0]);

    const isAfterStart = startDate ? dateOnly >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? dateOnly <= new Date(endDate) : true;

    const matchesDate = isAfterStart && isBeforeEnd;

    const isPV = entry.voucher_type === 'PV';
    const shouldHidePV = selectedPartyId && isPV;

    if (shouldHidePV) return false;

    const matchesParty = selectedPartyId
      ? entry.details.some(detail => String(detail.account_code) === String(selectedPartyId))
      : true;

    return matchesDate && matchesParty;
  });

  setMergedData(filtered);
  setCurrentPage(1);
  setHasSearched(true);
};

// exportCSV
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setAccountCode('');
    setSelectedPartyId('');
    setMergedData(originalData);
    setCurrentPage(1);
    setHasSearched(false)
    setSelectedPartyId('')
    
  };
const today = new Date().toISOString().split('T')[0];







const exportCSV = () => {
  const filteredRows = [];
  let runningBalance = 0;

  mergedData.forEach((voucher) => {
    voucher.details
      .filter((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const voucherType = voucher.voucher_type;

        const isNonZero = debit !== 0 || credit !== 0;
        const isValidAccount =
          voucherType === 'PV' ? true : !["1140001", "1110001"].includes(detail.account_code);

        if (["BR", "BP"].includes(voucherType)) {
          return isValidAccount && credit !== 0;
        }

        return isValidAccount && isNonZero;
      })
      .forEach((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const balance = debit - credit;

        // Update the running balance
        runningBalance += balance;

        filteredRows.push({
          VoucherID: `${voucher.voucher_type}-${voucher.voucher_id}`,
          Date: new Date(voucher.voucher_date).toLocaleDateString(),
          Particulars: detail.particulars || '-',
          Debit: debit.toFixed(2),
          Credit: credit.toFixed(2),
          Balance: runningBalance.toFixed(2),
        });
      });
  });

  // Convert the filteredRows to CSV
  json2csv(filteredRows, (err, csv) => {
    if (err) throw err;

    // Create a Blob and trigger a download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'voucher_details.csv';
    link.click();
  });
};



const exportExcel = () => {
  const filteredRows = [];
  let runningBalance = 0;

  mergedData.forEach((voucher) => {
    voucher.details
      .filter((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const voucherType = voucher.voucher_type;

        const isNonZero = debit !== 0 || credit !== 0;
        const isValidAccount =
          voucherType === 'PV' ? true : !["1140001", "1110001"].includes(detail.account_code);

        if (["BR", "BP"].includes(voucherType)) {
          return isValidAccount && credit !== 0;
        }

        return isValidAccount && isNonZero;
      })
      .forEach((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const balance = debit - credit;

        // Update the running balance
        runningBalance += balance;

        filteredRows.push({
          VoucherID: `${voucher.voucher_type}-${voucher.voucher_id}`,
          Date: new Date(voucher.voucher_date).toLocaleDateString(),
          Particulars: detail.particulars || '-',
          Debit: debit.toFixed(2),
          Credit: credit.toFixed(2),
          Balance: runningBalance.toFixed(2),
        });
      });
  });

  // Convert to a worksheet
  const ws = XLSX.utils.json_to_sheet(filteredRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Voucher Details');

  // Save the Excel file
  XLSX.writeFile(wb, 'voucher_details.xlsx');
};



const exportPDF = () => {
  const doc = new jsPDF();
  const filteredRows = [];
  let runningBalance = 0;  // Initial balance set to 0
  let totalDebit = 0;
  let totalCredit = 0;
  let totalBalance = 0;

  // Calculate running balance and totals for each row
  mergedData.forEach((voucher) => {
    voucher.details.forEach((detail) => {
      const debit = parseFloat(detail.debit) || 0;
      const credit = parseFloat(detail.credit) || 0;
      const balance = debit - credit;

      // Update the running balance
      runningBalance += balance;

      // Add row to filteredRows with the current balance
      filteredRows.push({
        VoucherID: `${voucher.voucher_type}-${voucher.voucher_id}`,
        Date: new Date(voucher.voucher_date).toLocaleDateString(),
        Particulars: detail.particulars || '-',
        Debit: debit.toFixed(2),
        Credit: credit.toFixed(2),
        Balance: runningBalance.toFixed(2),
      });

      // Accumulate totals for Debit, Credit, and Balance
      totalDebit += debit;
      totalCredit += credit;
      totalBalance += balance;
    });
  });

  doc.setFontSize(12);
  doc.text('Voucher Details', 20, 20);

  autoTable(doc, {
    startY: 30,
    head: [['#', 'VoucherID', 'Date', 'Particulars', 'Debit', 'Credit', 'Balance']],
    body: filteredRows.map((row, i) => [
      i + 1,                          // Row number
      row.VoucherID,                  // Voucher ID
      row.Date,                       // Date
      row.Particulars,                // Particulars
      row.Debit,                      // Debit
      row.Credit,                     // Credit
      row.Balance,                    // Balance
    ]),
    foot: [
      ['Total:', '', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2), totalBalance.toFixed(2)],
    ], 
  });

  // Save the PDF
  doc.save('Ledger.pdf');
};







  const handlePrint = () => {
    const headerHTML = `
      <div>
        <h2>Ledger of Account</h2>
        <p>From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || 'dd-mm-yyyy'}</p>
        <p>Account Title: ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''}</p>
        <p>Account Code: ${selectedPartyId || ''}</p>
      </div>
    `;

    const tableHTML = tableRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=650');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 14px; }
            thead { background-color: #f3f4f6; }
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


  const totalPages = Math.ceil(mergedData.length / itemsPerPage);

  
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

    const getVoucherLink = (voucher) => {
    const { voucher_type, id, voucher_id } = voucher;

    if (voucher_type === 'PV') {
      return `/Pages/Dashboard/Vouchers/Voucher/PV/${voucher_id}/${id}`;
    } else if (voucher_type === 'BP' || voucher_type === 'BR') {
      return `/Pages/Dashboard/Vouchers/Voucher/BP_BR/${id}/${voucher_id}`;
    } else if (voucher_type === 'CP' || voucher_type === 'CR') {
      return `/Pages/Dashboard/Vouchers/Voucher/CP_CR/${id}/${voucher_id}`;
    } else if (voucher_type === 'JV' || voucher_type === 'BRV') {
      return `/Pages/Dashboard/Vouchers/Voucher/JV_BRV/${id}/${voucher_id}`;
    }
    else {
      return `/Pages/Dashboard/Vouchers/Voucher/${voucher_type}/${id}/${voucher_id}`;
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Ledger</h2>
      </div>

      <div className='mt-4 mb-8 border-b-2 pb-4'>
        <p>Ledger of Account</p>
        <p>From: {startDate || 'dd-mm-yyyy'} To {endDate ||today }</p>
        <p>Account Title: {partyOptions.find(p => p.value === selectedPartyId)?.label || ''}</p>
        <p>Account Code: {selectedPartyId || ''}</p>
      </div>

      <div className="mb-6 border-b-2 pb-4">
        <div className="flex flex-wrap gap-4 items-center">
         <Select
  options={partyOptions}
  value={partyOptions.find(option => option.value === selectedPartyId ) || ''}
  onChange={(selectedOption) => setSelectedPartyId(selectedOption ? selectedOption.value : '')}
  placeholder="Select Party"
  isClearable
  className="flex-1"
  classNamePrefix="react-select"
/>


          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md flex-1"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md flex-1"
          />
        </div>

        <div className="mt-4 flex space-x-4">
          <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Search
          </button>
          <button onClick={handleReset} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Reset
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
        <div className="flex space-x-1">
          <button onClick={exportCSV} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">CSV</button>
          <button onClick={exportExcel} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Excel</button>
          <button onClick={exportPDF} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">PDF</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Print</button>
        </div>
        <div className='flex'>
           <input
    type="text"
    placeholder="Search in table..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-md w-64"
  />
        </div>
      </div>

{hasSearched && mergedData.length > 0  ? (
  <div ref={tableRef} className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
    <table className="min-w-full border-collapse">
          <thead className="bg-gray-500">
            <tr className='text-white'>
              <th className="px-6 py-3 text-center">#</th>
              <th className='px-6 py-3 text-center'>Type</th>
              <th className="px-6 py-3 text-center">Date</th>
              <th className="px-6 py-3 text-center">Particulars</th>
              <th className="px-6 py-3 text-center">Debit</th>
              <th className="px-6 py-3 text-center">Credit</th>
              <th className="px-6 py-3 text-center">Balance</th>
            </tr>
          </thead>
<tbody>
{(() => {
  const allRows = [];

  // Store all matching entries
  const filteredRows = [];

  // First, collect all filtered rows (before slicing for pagination)
  mergedData.forEach((voucher) => {
    voucher.details
      .filter((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const voucherType = voucher.voucher_type;

        const isNonZero = debit !== 0 || credit !== 0;
        const isValidAccount =
          voucherType === 'PV' ? true : !["1140001", "1110001"].includes(detail.account_code);

        if (["BR", "BP"].includes(voucherType)) {
          return isValidAccount && credit !== 0;
        }

        return isValidAccount && isNonZero;
      })
      .forEach((detail) => {
        const query = searchQuery.toLowerCase();
        const matches =
          !searchQuery.trim() ||
          (detail.particulars || '').toLowerCase().includes(query) ||
          String(detail.debit || '').includes(query) ||
          String(detail.credit || '').includes(query) ||
          (voucher.voucher_type || '').toLowerCase().includes(query) ||
          String(voucher.voucher_id || '').toLowerCase().includes(query);

        if (matches) {
          filteredRows.push({ voucher, detail });
        }
      });
  });

  // Calculate total debit, credit, and balance from all filtered data
  let totalDebit = 0;
  let totalCredit = 0;
  let totalBalance = 0;
  let runningBalance = 0;

  const paginatedStartIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEndIndex = paginatedStartIndex + itemsPerPage;

  filteredRows.forEach(({ voucher, detail }, index) => {
    const debit = parseFloat(detail.debit) || 0;
    const credit = parseFloat(detail.credit) || 0;

    totalDebit += debit;
    totalCredit += credit;

    runningBalance += debit - credit;

    // Only render rows on current page
    if (index >= paginatedStartIndex && index < paginatedEndIndex) {
      allRows.push(
        <tr key={`${voucher.id}-${index}`} className="border-t">
          <td className="px-3 py-4 text-center">{index + 1}</td> {/* Sequential row number */}
          <td className="px-3 py-4 text-center">
             <Link
                        className='hover:bg-gray-100 px-6 py-3'
                        href={getVoucherLink(voucher)}
                      >
                        {voucher.voucher_type}-{voucher.voucher_id}
             </Link>
          </td>
          <td className="px-3 py-4 text-center">{new Date(voucher.voucher_date).toLocaleDateString()}</td>
          <td className="px-3 py-4 text-left">{detail.particulars || '-'}</td>
          <td className="px-3 py-4 text-center">{formatCurrencyPK(debit.toFixed(2))}</td>
          <td className="px-3 py-4 text-center">{formatCurrencyPK(credit.toFixed(2))}</td>
          <td className="px-3 py-4 text-center">{formatCurrencyPK(runningBalance.toFixed(2))}</td>
        </tr>
      );
    }
  });

  const totalbalance = totalDebit - totalCredit;

  // Total summary row
  allRows.push(
    <tr key="summary-row" className="border-t bg-gray-100 font-semibold">
      <td colSpan="4" className="px-3 py-4 text-right">Total:</td>
      <td className="px-3 py-4 text-center">{formatCurrencyPK(totalDebit.toFixed(2))}</td>
      <td className="px-3 py-4 text-center">{formatCurrencyPK(totalCredit.toFixed(2))}</td>
      <td className="px-3 py-4 text-center">
        {`${formatCurrencyPK(Math.abs(totalbalance).toFixed(2))} ${totalbalance < 0 ? 'Cr' : 'Dr'}`}
      </td>
    </tr>
  );

  allRows.push(
    <tr key="balance-in-words" className="border-t bg-gray-50 italic text-sm">
      <td colSpan="7" className="px-3 py-4 text-left text-gray-600">
        Balance in Words: <strong>{numberToWords(Math.abs(Math.round(totalbalance)))} {totalbalance < 0 ? 'Credit' : 'Debit'}</strong>
      </td>
    </tr>
  );

  return allRows;
})()}








</tbody>









        </table>
  </div>
): hasSearched ? (
  <div className="text-center mt-10 text-gray-500">
    <p>No matching records found.</p>
  </div>
)  : (
  <div className="text-center mt-10 text-gray-500">
    <p>Please select a party or specify a date range to view the ledger.</p>
  </div>
)}

      {/* Pagination */}
{hasSearched && mergedData.length > 0 && (
  <div className="mt-6 flex justify-end items-center space-x-2">
    <button
      className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900"
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      <span className="sr-only">Prev Page</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </button>

    {(() => {
      const totalToShow = 5;
      const endPages = 5;

      const pageSet = new Set();

      const dynamicStart = Math.max(1, currentPage);
      const dynamicEnd = Math.min(currentPage + totalToShow - 1, totalPages - endPages);

      for (let i = dynamicStart; i <= dynamicEnd; i++) {
        pageSet.add(i);
      }

      for (let i = totalPages - endPages + 1; i <= totalPages; i++) {
        if (i > 0) pageSet.add(i);
      }

      const sortedPages = Array.from(pageSet).sort((a, b) => a - b);

      const renderedPages = [];
      let lastPage = 0;

      sortedPages.forEach((page, idx) => {
        if (lastPage && page - lastPage > 1) {
          renderedPages.push({ type: 'ellipsis', key: `ellipsis-${lastPage}-${page}` });
        }
        renderedPages.push({ type: 'page', value: page });
        lastPage = page;
      });

      return renderedPages.map((item, index) =>
        item.type === 'ellipsis' ? (
          <span key={item.key} className="px-2">...</span>
        ) : (
          <button
            key={`page-${item.value}`}
            className={`block w-8 h-8 rounded border ${
              currentPage === item.value
                ? 'bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-900'
            } text-center leading-8`}
            onClick={() => setCurrentPage(item.value)}
          >
            {item.value}
          </button>
        )
      );
    })()}

    <button
      className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900"
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      <span className="sr-only">Next Page</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </div>
)}





    </div>
  );
}

export default RouteList;
