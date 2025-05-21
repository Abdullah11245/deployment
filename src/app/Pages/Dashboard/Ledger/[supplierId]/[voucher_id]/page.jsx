'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  const itemsPerPage = 10;
  const tableRef = useRef(null);
 const { supplierId,voucher_id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      if (!supplierId) return;
  
      setLoading(true);
  
      try {
        const [
          voucherRes,
          voucherDetailRes,
          routesRes,
          partiesRes
        ] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get(`https://accounts-management.onrender.com/common/voucherDetail/mains/${supplierId}`),
          axios.get('https://accounts-management.onrender.com/common/routes/getAll'),
          axios.get('https://accounts-management.onrender.com/common/parties/getAll'),
        ]);
  
        const vouchers = voucherRes.data || [];
        const voucherDetails = voucherDetailRes.data || [];
        const parties = partiesRes.data || [];
        const supplierVoucherIds = new Set(voucherDetails.map(d => String(d.main_id)));
        const filteredVouchers = vouchers.filter(v => supplierVoucherIds.has(String(v.id)));
  
        const merged = filteredVouchers.map((voucher) => {
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
        setPartyOptions(parties.map(p => ({
          label: p.name,
          value: p.party_code
        })));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [supplierId]);
  
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };
  const getDetailsForVoucher = (id) => {
    const voucher = mergedData.find(v => v.id === id);
    return voucher ? voucher.details : [];
  };

  const getTotalDebit = (details) => {
    return details.reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0);
  };

  const handleSearch = () => {
    const filtered = originalData.filter(entry => {
      const voucherDate = new Date(entry.voucher_date);
      const dateOnly = new Date(voucherDate.toISOString().split('T')[0]);

      const isAfterStart = startDate ? dateOnly >= new Date(startDate) : true;
      const isBeforeEnd = endDate ? dateOnly <= new Date(endDate) : true;

      const matchesCode = accountCode
        ? entry.details.some(detail => String(detail.account_code) === String(accountCode))
        : true;

      const matchesParty = selectedPartyId
        ? entry.details.some(detail => String(detail.account_code) === String(selectedPartyId))
        : true;

      return isAfterStart && isBeforeEnd && matchesCode && matchesParty;
    });

    setMergedData(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setAccountCode('');
    setSelectedPartyId('');
    setMergedData(originalData);
    setCurrentPage(1);
  };

  const exportCSV = async () => {
    const headerInfo = [
      { 'Ledger of Account': '' },
      { From: startDate || 'dd-mm-yyyy', To: endDate || 'dd-mm-yyyy' },
      { 'Account Title': partyOptions.find(p => p.value === selectedPartyId)?.label || '', 'Account Code': selectedPartyId || '' },
      {},
    ];

    const dataToExport = mergedData.map((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      return {
        '#': index + 1,
        'Voucher #': voucher.voucher_id,
        'Date': new Date(voucher.voucher_date).toLocaleDateString(),
        'Party': voucher.party_code || 'N/A',
        'Nature/Mode': voucher.voucher_type,
        'Particulars': voucher.note,
        'Amount': getTotalDebit(details).toFixed(2),
      };
    });

    try {
      const csvHeader = await json2csv(headerInfo, { prependHeader: false });
      const csvData = await json2csv(dataToExport);
      const finalCSV = csvHeader + '\n' + csvData;

      const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'receipt_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const exportExcel = () => {
    const headerInfo = [
      ['Ledger of Account'],
      [`From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || 'dd-mm-yyyy'}`],
      [`Account Title: ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''}`],
      [`Account Code: ${selectedPartyId || ''}`],
      [],
    ];

    const dataToExport = mergedData.map((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      return {
        '#': index + 1,
        'Voucher #': voucher.voucher_id,
        'Date': new Date(voucher.voucher_date).toLocaleDateString(),
        'Party': voucher.party_code || 'N/A',
        'Nature/Mode': voucher.voucher_type,
        'Particulars': voucher.note,
        'Amount': getTotalDebit(details).toFixed(2),
      };
    });

    const dataArray = XLSX.utils.sheet_add_aoa(XLSX.utils.json_to_sheet(dataToExport, { skipHeader: false }), headerInfo, { origin: 'A1' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataArray, 'ReceiptReport');
    XLSX.writeFile(workbook, 'receipt_report.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Ledger of Account', 14, 10);

    doc.setFontSize(11);
    doc.text(`From: ${startDate || 'dd-mm-yyyy'} To: ${endDate || 'dd-mm-yyyy'}`, 14, 20);
    doc.text(`Account Title: ${partyOptions.find(p => p.value === selectedPartyId)?.label || ''}`, 14, 26);
    doc.text(`Account Code: ${selectedPartyId || ''}`, 14, 32);

    const tableColumn = ['#', 'Voucher #', 'Date', 'Party', 'Nature/Mode', 'Particulars', 'Amount'];
    const tableRows = [];

    mergedData.forEach((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      tableRows.push([
        index + 1,
        voucher.voucher_id,
        new Date(voucher.voucher_date).toLocaleDateString(),
        voucher.party_code || 'N/A',
        voucher.voucher_type,
        voucher.note,
        getTotalDebit(details).toFixed(2),
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save('receipt_report.pdf');
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
  const sortedData = [
  ...mergedData.filter(v =>
    v.voucher_type === 'JV' &&
    v.details?.some(d => d.particulars === 'Opening Balance')
  ),
  ...mergedData.filter(v =>
    !(v.voucher_type === 'JV' && v.details?.some(d => d.particulars === 'Opening Balance'))
  ),
];

const indexOfFirstVoucher = (currentPage - 1) * itemsPerPage;
const indexOfLastVoucher = currentPage * itemsPerPage;
const handlePageChange = (pageNumber) => {
  if (pageNumber < 1 || pageNumber > Math.ceil(mergedData.length / itemsPerPage)) return;
  setCurrentPage(pageNumber);
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
    } else {
      return `/Pages/Dashboard/Vouchers/Voucher/${voucher_type}/${id}/${voucher_id}`;
    }
  };  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Ledger</h2>
      </div>

      <div className='mt-4 mb-8 border-b-2 pb-4'>
        <p>Ledger of Account</p>
        <p>From: {startDate || 'dd-mm-yyyy'} To {endDate || 'dd-mm-yyyy'}</p>
        <p>Account Title: {decodeURIComponent(voucher_id)}</p>
        <p>Account Code: {supplierId}</p>
      </div>

      <div className="mb-6 border-b-2 pb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-md flex-1"
          >
            <option value="">Select Party</option>
            {partyOptions.map((party) => (
              <option key={party.value} value={party.value}>
                {party.label}
              </option>
            ))}
          </select>

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
      </div>

      <div ref={tableRef} className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th>Type</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Particulars</th>
              <th className="px-6 py-3">Debit</th>
              <th className="px-6 py-3">Credit</th>
              <th className="px-6 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
  {sortedData
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((voucher, voucherIndex) => {
      const voucherDetails = voucher.details || [];
      const rowSpan = voucherDetails.length || 1;

      return voucherDetails.length > 0 ? (
        voucherDetails.map((detail, detailIndex) => (
          <tr key={`${voucher.id}-${detailIndex}`} className="border-t">
            {detailIndex === 0 && (
              <>
                <td className="px-6 py-4" rowSpan={rowSpan}>{(currentPage - 1) * itemsPerPage + voucherIndex + 1}</td>
                <td className="px-6 py-4" rowSpan={rowSpan}>
                  <Link
                    className='bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded'
                    href={getVoucherLink(voucher)}
                  >
                    {voucher.voucher_type}-{voucher.voucher_id}
                  </Link>
                </td>
                <td className="px-6 py-4" rowSpan={rowSpan}>
                  {new Date(voucher.voucher_date).toLocaleDateString()}
                </td>
              </>
            )}
            <td className="px-6 py-4">{detail.particulars}</td>
            <td className="px-6 py-4">{formatCurrencyPK((parseFloat(detail.debit) || 0).toFixed(2))}</td>
            <td className="px-6 py-4">{formatCurrencyPK((parseFloat(detail.credit) || 0).toFixed(2))}</td>
            {detailIndex === 0 && (
              <td className="px-6 py-4" rowSpan={rowSpan}>
                {formatCurrencyPK(
                  voucherDetails.reduce((total, d) => total + (parseFloat(d.debit) || 0) - (parseFloat(d.credit) || 0), 0).toFixed(2)
                )}
              </td>
            )}
          </tr>
        ))
      ) : (
        <tr key={`${voucher.id}-no-details`} className="border-t">
          <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + voucherIndex + 1}</td>
          <td className="px-6 py-4">
            <Link
              className='bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded'
              href={getVoucherLink(voucher)}
            >
              {voucher.voucher_type}-{voucher.voucher_id}
            </Link>
          </td>
          <td className="px-6 py-4">{new Date(voucher.voucher_date).toLocaleDateString()}</td>
          <td className="px-6 py-4" colSpan={3}>No Details</td>
          <td className="px-6 py-4">0</td>
        </tr>
      );
    })}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-semibold text-gray-700">
          Showing {indexOfFirstVoucher + 1} to {Math.min(indexOfLastVoucher, mergedData.length)} of {mergedData.length} entries
        </span>

        <div className="flex gap-2 text-xs font-medium">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
          >
            <span className="sr-only">Previous</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
            </svg>
          </button>

          {[...Array(Math.ceil(mergedData.length / itemsPerPage))].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePageChange(idx + 1)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded border ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'}`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(mergedData.length / itemsPerPage)}
            className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
          >
            <span className="sr-only">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteList;
