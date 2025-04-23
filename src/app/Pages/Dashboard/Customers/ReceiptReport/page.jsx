'use client';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv'; // ✅ Correct import

function Receiptreport() {
  const [routes, setRoutes] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParty, setSelectedParty] = useState([]);
  const [selectedCashBank, setSelectedCashBank] = useState([]);
  const [partiesOptions, setPartiesOptions] = useState([]);
  const [banksOptions, setBanksOptions] = useState([]);
  const [originalRoutes, setOriginalRoutes] = useState([]);
  const [originalVoucherDetails, setOriginalVoucherDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes, partiesRes, banksRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll'),
          axios.get('https://accounts-management.onrender.com/common/parties/getAll'),
          axios.get('https://accounts-management.onrender.com/common/banks/getAll')
          
        ]);

        setRoutes(voucherRes.data || []);
        setVoucherDetails(detailRes.data || []);
        setOriginalRoutes(voucherRes.data || []);
        setOriginalVoucherDetails(detailRes.data || []);
        setPartiesOptions(partiesRes.data.map(party => ({ value: party.id, label: party.name })));

        const banksData = banksRes.data.map(bank => ({
          value: bank.account_code,
          label: bank.account_title
        }));

        setBanksOptions([
          { value: 'All', label: 'All' },
          ...banksData,
          { value: 'Cash', label: 'Cash' }
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDetailsForVoucher = (voucherId) =>
    voucherDetails.filter((detail) => detail.main_id === voucherId);

  const getTotalDebit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);

  const handleSearch = () => {
    let filteredData = originalRoutes;

    if (startDate) {
      filteredData = filteredData.filter(route => {
        const routeDate = new Date(route.voucher_date).toISOString().split('T')[0];
        return routeDate >= startDate;
      });
    }

    if (endDate) {
      filteredData = filteredData.filter(route => {
        const routeDate = new Date(route.voucher_date).toISOString().split('T')[0];
        return routeDate <= endDate;
      });
    }

    if (selectedParty.length > 0) {
      filteredData = filteredData.filter(route =>
        selectedParty.some(party => party.value === route.party_id)
      );
    }

    if (selectedCashBank.length > 0 && !selectedCashBank.some(item => item.value === 'All')) {
      filteredData = filteredData.filter(route =>
        selectedCashBank.some(bank => bank.value === route.account_code)
      );
    }

    setRoutes(filteredData);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedParty([]);
    setSelectedCashBank([]);
    setRoutes(originalRoutes);
  };

  const exportCSV = async () => {
    const dataToExport = routes.map((route, index) => {
      const details = getDetailsForVoucher(route.id);
      return {
        '#': index + 1,
        'Voucher #': route.voucher_id,
        'Date': new Date(route.voucher_date).toLocaleDateString(),
        'Party': route.party_code || 'N/A',
        'Nature/Mode': route.voucher_type,
        'Particulars': route.note,
        'Amount': getTotalDebit(details).toFixed(2),
      };
    });

    try {
      const csv = await json2csv(dataToExport); // ✅ Correct usage
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
    const dataToExport = routes.map((route, index) => {
      const details = getDetailsForVoucher(route.id);
      return {
        '#': index + 1,
        'Voucher #': route.voucher_id,
        'Date': new Date(route.voucher_date).toLocaleDateString(),
        'Party': route.party_code || 'N/A',
        'Nature/Mode': route.voucher_type,
        'Particulars': route.note,
        'Amount': getTotalDebit(details).toFixed(2),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReceiptReport');
    XLSX.writeFile(workbook, 'receipt_report.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['#', 'Voucher #', 'Date', 'Party', 'Nature/Mode', 'Particulars', 'Amount'];
    const tableRows = [];

    routes.forEach((route, index) => {
      const details = getDetailsForVoucher(route.id);
      tableRows.push([
        index + 1,
        route.voucher_id,
        new Date(route.voucher_date).toLocaleDateString(),
        route.party_code || 'N/A',
        route.voucher_type,
        route.note,
        getTotalDebit(details).toFixed(2),
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('receipt_report.pdf');
  };

  const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=650');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 8px 12px;
              border: 1px solid #ddd;
              font-size: 14px;
              text-align: left;
            }
            thead {
              background-color: #f3f4f6;
            }
          </style>
        </head>
        <body>
          <h2>Receipt Report</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Receipt Report</h2>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mt-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">Party Name</label>
          <Select
            isMulti
            options={partiesOptions}
            value={selectedParty}
            onChange={setSelectedParty}
            className="mt-2"
            placeholder="Select Party"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">Cash or Banks</label>
          <Select
            isMulti
            options={banksOptions}
            value={selectedCashBank}
            onChange={setSelectedCashBank}
            className="mt-2"
            placeholder="Select Cash or Bank"
          />
        </div>
      </div>

      <div className="mt-4 flex space-x-4">
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">Search</button>
        <button onClick={handleReset} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">Reset</button>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <div className="flex space-x-1">
          <button onClick={exportCSV} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">CSV</button>
          <button onClick={exportExcel} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Excel</button>
          <button onClick={exportPDF} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">PDF</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md">Print</button>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parties</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nature/Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {routes.length > 0 ? (
              routes.map((route, index) => {
                const details = getDetailsForVoucher(route.id);
                const totalAmount = getTotalDebit(details).toFixed(2);

                return (
                  <tr key={route.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{route.voucher_id}-{route.voucher_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(route.voucher_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{route.party_code || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{route.voucher_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{route.note}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">${totalAmount}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-sm text-gray-700 text-center">
                  No data found for the applied filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Receiptreport;
