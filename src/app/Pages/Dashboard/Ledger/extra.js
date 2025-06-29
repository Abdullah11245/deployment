'use client';

import React, { useState, useEffect, useRef,useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';
import Select from 'react-select'; // For dropdowns
import Link from 'next/link';
import end_points from '../../../api_url';

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
  const [beforeStartBalance, setBeforeStartBalance] = useState(0);

  const itemsPerPage = 200;
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
          axios.get(`${end_points}/voucher/getAll`),
          axios.get(`${end_points}/voucherDetail/getAll`),
          axios.get(`${end_points}/routes/getAll`),
          axios.get(`${end_points}/parties/getAll`),
          axios.get(`${end_points}/suppliers/getAll`),
          axios.get(`${end_points}/banks/getAll`)
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


  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setAccountCode('');
    setSelectedPartyId('');
    setMergedData(originalData);
    setCurrentPage(1);
    setHasSearched(false)
    setSelectedPartyId('')
    setBeforeStartBalance(0)
    
  };

const today = new Date().toISOString().split('T')[0];














const exportCSV = () => {
  const filteredRows = [];
  let runningBalance = beforeStartBalance || 0;

  const headerInfo = [
    ['Ledger of Account'],
    [`From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || 'dd-mm-yyyy'}`],
    [`Account Title: ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''}`],
    [`Account Code: ${selectedPartyId || ''}`],
    [], // Empty row before table
  ];

  // Add opening balance row if applicable
  if (startDate) {
    filteredRows.push({
      VoucherID: '-',
      Date: new Date(startDate).toLocaleDateString(),
      Particulars: 'Opening Balance',
      Debit: '-',
      Credit: '-',
      Balance: runningBalance,
    });
  }

  const transactions = [];

  sortedData.forEach((voucher) => {
    voucher.details
      .filter((detail) => String(detail.account_code) === String(selectedPartyId))
      .forEach((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const isOpeningEntry = (detail.particulars || '').toLowerCase().includes('opening balance');

        transactions.push({
          isOpeningEntry,
          row: {
            VoucherID: `${voucher.voucher_type}-${voucher.voucher_id}`,
            Date: new Date(voucher.voucher_date).toLocaleDateString(),
            Particulars: detail.particulars || '-',
            Debit: debit,
            Credit: credit,
            runningBalance: debit - credit,
          },
        });
      });
  });

  // Sort to bring opening entries to top
  const sortedRows = transactions
    .sort((a, b) => (a.isOpeningEntry ? -1 : 0))
    .map((entry) => {
      runningBalance += entry.row.runningBalance;
      return {
        ...entry.row,
        Balance: runningBalance,
      };
    });

  filteredRows.push(...sortedRows);

  // Convert to CSV
  json2csv([...headerInfo, ...filteredRows], (err, csv) => {
    if (err) throw err;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ledger.csv';
    link.click();
  });
};




const exportExcel = () => {
  let runningBalance = beforeStartBalance || 0;

  const sheetData = [
    ['Ledger of Account'],
    [`From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || 'dd-mm-yyyy'}`],
    [`Account Title: ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''}`],
    [`Account Code: ${selectedPartyId || ''}`],
    [], // Empty row before table
    ['Voucher ID', 'Date', 'Particulars', 'Debit', 'Credit', 'Balance'],
  ];

  // Opening balance row if applicable
  if (startDate) {
    sheetData.push([
      '-', // Voucher ID
      new Date(startDate).toLocaleDateString(),
      'Opening Balance',
      '-', '-', 
      runningBalance
    ]);
  }

  const transactions = [];

  sortedData.forEach((voucher) => {
    voucher.details
      .filter(detail => String(detail.account_code) === String(selectedPartyId))
      .forEach((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const isOpeningEntry = (detail.particulars || '').toLowerCase().includes('opening balance');

        transactions.push({
          isOpeningEntry,
          row: {
            VoucherID: `${voucher.voucher_type}-${voucher.voucher_id}`,
            Date: new Date(voucher.voucher_date).toLocaleDateString(),
            Particulars: detail.particulars || '-',
            Debit: debit,
            Credit: credit,
            runningBalance: debit - credit,
          },
        });
      });
  });

  // Sort to bring opening balance entry to top
  const sortedRows = transactions
    .sort((a, b) => (a.isOpeningEntry ? -1 : 0))
    .map(entry => {
      runningBalance += entry.row.runningBalance;
      return [
        entry.row.VoucherID,
        entry.row.Date,
        entry.row.Particulars,
        entry.row.Debit,
        entry.row.Credit,
        runningBalance
      ];
    });

  sheetData.push(...sortedRows);

  // Create worksheet & workbook
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');

  // Save file
  XLSX.writeFile(workbook, 'ledger.xlsx');
};




const exportPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const partyLabel = partyOptions.find(p => p.value === selectedPartyId)?.label || '';
  const formattedStart = startDate || 'dd-mm-yyyy';
  const formattedEnd = endDate || today;
  const accountCode = selectedPartyId || '';

  // --- HEADER ---
  doc.setFontSize(18);
  doc.setFont(undefined, 'normal');
  doc.text(partyLabel, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setLineWidth(0.1);
  doc.rect((pageWidth - 100) / 2, 25, 100, 10);
  doc.text('Ledger of Account', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`From: ${formattedStart} To: ${formattedEnd}`, pageWidth / 2, 45, { align: 'center' });

  let yOffset = 60;

  // --- DATA PROCESSING ---
  let runningBalance = beforeStartBalance || 0;
  const filteredRows = [];

  if (startDate) {
    filteredRows.push([
      '-', new Date(startDate).toLocaleDateString(),
      'Opening Balance', '-', '-', runningBalance
    ]);
  }

  const transactions = [];

  sortedData.forEach(voucher => {
    voucher.details
      .filter(detail => {
        const voucherDate = new Date(voucher.voucher_date);
        const isAfterStart = startDate ? voucherDate >= new Date(startDate) : true;
        const isBeforeEnd = endDate ? voucherDate <= new Date(endDate) : true;
        return isAfterStart && isBeforeEnd &&
               String(detail.account_code) === String(selectedPartyId) &&
               (parseFloat(detail.debit) || parseFloat(detail.credit));
      })
      .forEach(detail => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        const balanceChange = debit - credit;

        transactions.push({
          VoucherID: `${voucher.voucher_type}-${voucher.voucher_id}`,
          Date: new Date(voucher.voucher_date).toLocaleDateString(),
          Particulars: detail.particulars || '-',
          Debit: debit,
          Credit: credit,
          Balance: balanceChange
        });
      });
  });

  transactions.forEach(tx => {
    runningBalance += tx.Balance;
    filteredRows.push([
      tx.VoucherID,
      tx.Date,
      tx.Particulars,
      tx.Debit,
      tx.Credit,
      runningBalance
    ]);
  });

  const totalDebit = transactions.reduce((sum, t) => sum + parseFloat(t.Debit), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + parseFloat(t.Credit), 0);
  const finalBalance = runningBalance;

  // --- TABLE ---
autoTable(doc, {
  startY: yOffset,
  head: [['Type', 'Date', 'Particulars', 'Debit', 'Credit', 'Balance']],
  body: filteredRows,
  theme: 'grid',
  styles: {
    fontSize: 10,
    halign: 'left',
    valign: 'middle',
  },
  headStyles: {
    fillColor: [255, 255, 255],
    textColor: 0,
    lineWidth: 0.1,
    lineColor: 0,
    fontStyle: 'bold',
  },
  columnStyles: {
    0: { cellWidth: 25 }, // Type
    1: { cellWidth: 28 }, // Date (⬅️ increased from default)
    2: { cellWidth: 65 }, // Particulars
    3: { cellWidth: 20 }, // Debit
    4: { cellWidth: 20 }, // Credit
    5: { cellWidth: 25 }  // Balance
  }
});


  // --- CUSTOM SUMMARY ROW (Styled Like Print UI) ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const rowHeight = 8;
  const cellPadding = 2;
  const fontSize = 10;

  const debitText = formatCurrencyPK(totalDebit);
  const creditText = formatCurrencyPK(totalCredit);
  const balanceText = `${formatCurrencyPK(Math.abs(finalBalance))} ${finalBalance < 0 ? 'Cr' : 'Dr'}`;
  const balanceInWords = `${numberToWords(Math.abs(Math.round(finalBalance)))} ${finalBalance < 0 ? 'Credit' : 'Debit'}`;

  // Column positions and widths
  const startX = 14;
  const colWidths = [20, 95, 25, 25, 30]; // Total, Words, Debit, Credit, Balance
  const colPositions = colWidths.reduce((acc, width, i) => {
    const prevX = i === 0 ? startX : acc[i - 1];
    acc.push(prevX + (i === 0 ? 0 : colWidths[i - 1]));
    return acc;
  }, []);

  // Draw each cell
  doc.setFontSize(fontSize);
  doc.setLineWidth(0.5);
  doc.setDrawColor(0); // Black borders

  // Column 1: "Total"
  doc.setFont(undefined, 'bold');
  doc.text('Total', colPositions[0] + cellPadding, finalY + rowHeight / 2 + 2);
  doc.rect(colPositions[0], finalY, colWidths[0], rowHeight);

  // Column 2: Balance in Words (wrapped & vertically centered)
  doc.setFont(undefined, 'italic');
  const wordsX = colPositions[1];
  const wordsY = finalY;
  const wordsWidth = colWidths[1];
  const maxTextWidth = wordsWidth - 2 * cellPadding;

  const wrappedWords = doc.splitTextToSize(balanceInWords, maxTextWidth);
  const lineHeight = 4.5;
  const textBlockHeight = wrappedWords.length * lineHeight;
  const verticalPadding = (rowHeight - textBlockHeight) / 2;
  const textY = wordsY + verticalPadding + lineHeight - 1;

  doc.text(wrappedWords, wordsX + cellPadding, textY, {
    maxWidth: maxTextWidth
  });
  doc.rect(wordsX, wordsY, wordsWidth, rowHeight);

  // Column 3: Debit
  doc.setFont(undefined, 'bold');
  doc.text(debitText, colPositions[2] + cellPadding, finalY + rowHeight / 2 + 2);
  doc.rect(colPositions[2], finalY, colWidths[2], rowHeight);

  // Column 4: Credit
  doc.text(creditText, colPositions[3] + cellPadding, finalY + rowHeight / 2 + 2);
  doc.rect(colPositions[3], finalY, colWidths[3], rowHeight);

  // Column 5: Balance
  doc.text(balanceText, colPositions[4] + cellPadding, finalY + rowHeight / 2 + 2);
  doc.rect(colPositions[4], finalY, colWidths[4], rowHeight);

  // --- SAVE PDF ---
  doc.save('ledger.pdf');
};














//   const handlePrint = () => {
//    const headerHTML = `
//   <div style="text-align: center; margin-bottom: 20px; flex-direction: column; align-items: center;">
//     <p style="font-size: 24px; margin-bottom: 20px; ">
//       ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''} ()
//     </p>
//     <div style="border: 2px solid black; padding: 8px; display: inline-block; text-align:center; font-size: 18px; ">

//     Ledger of Account
//     </div>
//     <p style="margin-top: 20px;">
//       From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || today}
//     </p>
   
//   </div>
// `;


//     const tableHTML = tableRef.current.innerHTML;
//     const printWindow = window.open('', '', 'width=900,height=650');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Receipt Report</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 14px; }
//             thead { background-color: #f3f4f6; }
//           </style>
//         </head>
//         <body>
//           ${headerHTML}
//           ${tableHTML}
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   };

const handlePrint = () => {
 const headerHTML = `
  <div style="text-align: center; margin-bottom: 20px; flex-direction: column; align-items: center;">
    <p style="font-size: 24px; margin-bottom: 20px; ">
      ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''} ()
    </p>
    <div style="border: 2px solid black; padding: 8px; display: inline-block; text-align:center; font-size: 18px; ">

    Ledger of Account
    </div>
    <p style="margin-top: 20px;">
      From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || today}
    </p>
   
  </div>
`;

  const tableHTML = tableRef.current.innerHTML;

  // Compute the total values (copy logic from your component if needed)
  let totalDebit = 0;
  let totalCredit = 0;
  let runningBalance = 0;

  sortedData.forEach((voucher) => {
    voucher.details
      .filter((detail) => {
        const voucherDate = new Date(voucher.voucher_date);
        const isAfterStart = startDate ? voucherDate >= new Date(startDate) : true;
        const isBeforeEnd = endDate ? voucherDate <= new Date(endDate) : true;
        return isAfterStart && isBeforeEnd && String(detail.account_code) === String(selectedPartyId) && (parseFloat(detail.debit) || parseFloat(detail.credit));
      })
      .forEach((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;
        totalDebit += debit;
        totalCredit += credit;
        runningBalance += debit - credit;
      });
  });

  const totalSummaryHTML = `
    <div style=" font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
   <div style="font-weight: bold;  border-top: 2px solid #000; border-bottom: 2px solid #000;  padding: 10px 0;">Total</div>
     <div style=" font-style: italic; font-size: 14px;  border-top: 2px solid #000; border-bottom: 2px solid #000;  padding: 5px 0; width:50%">
       <strong>${numberToWords(Math.abs(Math.round(runningBalance)))} ${runningBalance < 0 ? 'Credit' : 'Debit'}</strong>
    </div>
      <div style=" border-top: 2px solid #000; border-bottom: 2px solid #000;  padding: 10px 0;"> ${formatCurrencyPK(totalDebit)}</div>
      <div style=" border-top: 2px solid #000; border-bottom: 2px solid #000;  padding: 10px 0;"> ${formatCurrencyPK(totalCredit)}</div>
      <div style=" border-top: 2px solid #000; border-bottom: 2px solid #000;  padding: 10px 0;"> ${formatCurrencyPK(Math.abs(runningBalance))} ${runningBalance < 0 ? 'Cr' : 'Dr'}</div>
    </div>
   
  `;

  const printWindow = window.open('', '', 'width=900,height=650');
  printWindow.document.write(`
    <html>
      <head>
        <title>Ledger Report</title>
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
        ${totalSummaryHTML}
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


  
const sortedData = mergedData
  .filter(voucher => {
    if (voucher.voucher_type !== 'JV') return true;

    const hasOpeningBalance = voucher.details.some(
      d => d.particulars?.toLowerCase().includes('opening balance')
    );

    const hasOpeningBalanceForSelected = voucher.details.some(
      d => d.particulars?.toLowerCase().includes('opening balance') &&
           String(d.account_code) === String(selectedPartyId)
    );

    if (!hasOpeningBalance) return true;

    return hasOpeningBalanceForSelected;
  })
  .map(voucher => {
    if (voucher.voucher_type === 'JV') {
      return {
        ...voucher,
        details: voucher.details.filter(
          d => !d.particulars?.toLowerCase().includes('opening balance') ||
               String(d.account_code) === String(selectedPartyId)
        ),
      };
    }
    return voucher;
  })
  .sort((a, b) => {
    const isOpeningA = a.details.some(
      d => d.particulars?.toLowerCase().includes('opening balance') &&
           String(d.account_code) === String(selectedPartyId)
    );
    const isOpeningB = b.details.some(
      d => d.particulars?.toLowerCase().includes('opening balance') &&
           String(d.account_code) === String(selectedPartyId)
    );

    if (isOpeningA && !isOpeningB) return -1;
    if (!isOpeningA && isOpeningB) return 1;
    return 0;
  });



const handleCardPrint = () => {
  // Extract values from state or props
  const partyName = partyOptions.find(p => p.value === selectedPartyId)?.label || '';
  const partyAddress = partyOptions.find(p => p.value === selectedPartyId)?.address || '';
  const shopkeeperName = shopkeeperNameState || '';

  // Compute aggregated values
  const monthLabel = new Date(startDate).toLocaleString('ur-PK', { month: 'long', year: 'numeric' });
  const credit = formatCurrencyPK(totalCredit);         // total for filtered rows
  const totalWeight = `${totalWeightValue} کلو`;         // computed sum of weights
  const rate = rateValue ? `${formatCurrencyPK(rateValue)}/کلو` : '';
  const totalAmount = formatCurrencyPK(totalAmountValue);
  const remainingAmount = formatCurrencyPK(remainingAmountValue);

  const data = {
    month: monthLabel,
    credit,
    weight: totalWeight,
    rate,
    totalAmount,
    remainingAmount
  };

  const headerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="margin-bottom: 10px;">${partyName}</h2>
      <div style="border: 2px solid black; border-radius: 8px; padding: 10px; display: inline-block; font-size: 16px;">
        ${partyAddress}
      </div>
      <p style="margin-top: 20px; font-size: 16px; border-bottom: 1px solid #000; padding-bottom: 8px; width: 100%;">
        دکاندار: ${shopkeeperName}
      </p>
    </div>
  `;

  const createPair = (label1, value1, label2, value2) => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <div style="flex: 1; margin-left: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <label>${label1}</label>
          <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 10px; padding-bottom: 4px;">${value1}</div>
        </div>
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <label>${label2}</label>
          <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 10px; padding-bottom: 4px;">${value2}</div>
        </div>
      </div>
    </div>
  `;

  const infoSection = `
    <div style="font-size: 16px;">
      ${createPair("مہینہ", data.month, "قرض", data.credit)}
      ${createPair("وزن", data.weight, "ریٹ", data.rate)}
      ${createPair("کل رقم", data.totalAmount, "باقی رقم", data.remainingAmount)}
    </div>
  `;

  const printWindow = window.open('', '', 'width=700,height=600');
  printWindow.document.write(`
    <html dir="rtl" lang="ur">
      <head>
        <title>پرنٹ سلپ</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
          body {
            font-family: 'Noto Nastaliq Urdu', serif;
            padding: 40px;
            font-size: 16px;
            direction: rtl;
          }
          label {
            font-weight: bold;
            font-size: 14px;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        ${headerHTML}
        ${infoSection}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};








  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Ledger</h2>
      </div>

      <div className='mt-4 mb-8 border-b-2 pb-4 text-black'>
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
  className="flex-1 text-black"
  classNamePrefix="react-select"
/>


         <input
  type="date"
  value={startDate}
  onChange={(e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    let debitBefore = 0;
    let creditBefore = 0;
    originalData.forEach((voucher) => {
      voucher.details.forEach((detail) => {
        const voucherDate = new Date(voucher.voucher_date);
        const isBeforeStart = newStartDate ? voucherDate <= new Date(newStartDate) : false;
        const isValidAccount = String(detail.account_code) === String(selectedPartyId);

        if (isBeforeStart && isValidAccount) {
          debitBefore += parseFloat(detail.debit) || 0;
          creditBefore += parseFloat(detail.credit) || 0;
        }
      });
    });

    setBeforeStartBalance(debitBefore - creditBefore);
  }}
  className="px-4 py-2 border border-gray-300 rounded-md flex-1 text-black"
/>

          <input
            type="date"
            value={endDate}

            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md flex-1 text-black"
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
          <button onClick={handleCardPrint} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Card Print</button>
        </div>
        <div className='flex'>
           <input
    type="text"
    placeholder="Search in table..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-md w-64 text-black"
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
  const filteredRows = [];

  let totalDebit = 0;
  let totalCredit = 0;
   let runningBalance=0;
if (startDate) {
  allRows.push(
    <tr key="opening-balance-row" className="bg-yellow-100 text-gray-800 font-medium">
      <td className="px-3 py-4 text-center">-</td>
      <td className="px-3 py-4 text-center">-</td>
      <td className="px-3 py-4 text-center">{new Date(startDate).toLocaleDateString()}</td>
      <td className="px-3 py-4 text-left">Opening Balance</td>
      <td className="px-3 py-4 text-center">-</td>
      <td className="px-3 py-4 text-center">-</td>
      <td className="px-3 py-4 text-center">{formatCurrencyPK(beforeStartBalance)}</td>
    </tr>
  );
}

  // Handle pagination
  const paginatedStartIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEndIndex = paginatedStartIndex + itemsPerPage;

  let displayIndex = 1;

  sortedData.forEach((voucher) => {

    voucher.details
      .filter((detail) => {
        const voucherDate = new Date(voucher.voucher_date);
        const isAfterStart = startDate ? voucherDate >= new Date(startDate) : true;
        const isBeforeEnd = endDate ? voucherDate <= new Date(endDate) : true;
        return isAfterStart && isBeforeEnd && String(detail.account_code) === String(selectedPartyId) && (parseFloat(detail.debit) || parseFloat(detail.credit));
      })
      .forEach((detail) => {
        const debit = parseFloat(detail.debit) || 0;
        const credit = parseFloat(detail.credit) || 0;

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

  filteredRows.forEach(({ voucher, detail }, index) => {
    const debit = parseFloat(detail.debit) || 0;
    const credit = parseFloat(detail.credit) || 0;

    totalDebit += debit;
    totalCredit += credit;

    runningBalance += debit - credit;

    if (index >= paginatedStartIndex && index < paginatedEndIndex) {
      allRows.push(
        <tr key={`${voucher.id}-${index}`} className="border-t text-black">
          <td className="px-3 py-4 text-center">{displayIndex++}</td>
          <td className="px-3 py-4 text-center">
            <Link href={getVoucherLink(voucher)} className="hover:underline">
              {voucher.voucher_type}-{voucher.voucher_id}
            </Link>
          </td>
          <td className="px-3 py-4 text-center">{new Date(voucher.voucher_date).toLocaleDateString()}</td>
          <td className="px-3 py-4 text-left">{detail.particulars || '-'}</td>
          <td className="px-3 py-4 text-center">{formatCurrencyPK(debit)}</td>
          <td className="px-3 py-4 text-center">{formatCurrencyPK(credit)}</td>
          <td className="px-3 py-4 text-center">{formatCurrencyPK(typeof runningBalance === 'number' ? runningBalance : 'N/A')}</td>
        </tr>
      );
    }
  });

  const totalbalance = runningBalance;

  // Add summary row
  allRows.push(
    <tr key="summary-row" className="border-t bg-gray-100  text-black font-semibold">
      <td colSpan="4" className="px-3 py-4 text-right">Total:</td>
      <td className="px-3 py-4 text-center">{formatCurrencyPK(totalDebit)}</td>
      <td className="px-3 py-4 text-center">{formatCurrencyPK(totalCredit)}</td>
      <td className="px-3 py-4 text-center">
        {`${formatCurrencyPK(Math.abs(totalbalance))} ${totalbalance < 0 ? 'Cr' : 'Dr'}`}
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
{hasSearched && sortedData.length > 0 && (
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
