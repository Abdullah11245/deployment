'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';
import end_points from '../../../api_url';

function Diary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Number of items per page (you can adjust this)
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const [supplierMap, setSupplierMap] = useState({});
  const [bankMap, setBankMap] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${end_points}/diaryVoucher/getAll`);
        const result = await res.json();
        setData(result);
  
        // Extract unique supplier and bank codes
        const uniqueSupplierCodes = [...new Set(result.map(item => item.supplier_code).filter(Boolean))];
        const uniqueBankCodes = [...new Set(result.map(item => item.bank_code).filter(Boolean))];
  
        const supplierResponses = await Promise.all(
          uniqueSupplierCodes.map(code =>
            fetch(`${end_points}/suppliers/supplier/${code}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
        );
        const supplierMapData = {};
        supplierResponses.forEach((res, i) => {
          if (res) supplierMapData[uniqueSupplierCodes[i]] = res.name;
        });
        setSupplierMap(supplierMapData);
  
        const bankResponses = await Promise.all(
          uniqueBankCodes.map(code =>
            fetch(`${end_points}/banks/bank/${code}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
        );
        const bankMapData = {};
        bankResponses.forEach((res, i) => {
          if (res) bankMapData[uniqueBankCodes[i]] = res.account_title;
        });
        setBankMap(bankMapData);
  
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  const filteredData = data.filter(entry => {
    const bankName = bankMap[entry.bank_code]?.toLowerCase() || '';
    const supplierName = supplierMap[entry.supplier_code]?.toLowerCase() || '';
    const issueDate = entry.issue_date?.split('T')[0] || '';
    const chequeDate = entry.cheque_date?.split('T')[0] || '';
    
    return (
      bankName.includes(searchTerm) ||
      supplierName.includes(searchTerm) ||
      issueDate.includes(searchTerm) ||
      chequeDate.includes(searchTerm)
    );
  });
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };

  const exportToPDF = () => {
    const formattedData = currentItems.map((entry, index) => ({
      '#': indexOfFirstItem + index + 1,
      'Issue Date': entry.issue_date?.split('T')[0],
      'Cheque Date': entry.cheque_date?.split('T')[0],
      'Cheque No.': entry.cheque_no,
      'Amount': formatCurrencyPK(entry.cheque_amount),
      'Bank': bankMap[entry.bank_code] || entry.bank_code,
      'Supplier': supplierMap[entry.supplier_code] || entry.supplier_code,
      'Particulars': entry.particulars,
    }));
  
    const doc = new jsPDF();
    doc.autoTable({
      head: [['#', 'Issue Date', 'Cheque Date', 'Cheque No.', 'Amount', 'Bank', 'Supplier', 'Particulars']],
      body: formattedData.map(obj => Object.values(obj)),
    });
    doc.save('Diary_Voucher_List.pdf');
  };
  
  const exportVoucherData = () => {
    const formattedData = currentItems.map((entry, index) => ({
      '#': indexOfFirstItem + index + 1,
      'Issue Date': entry.issue_date?.split('T')[0],
      'Cheque Date': entry.cheque_date?.split('T')[0],
      'Cheque No.': entry.cheque_no,
      'Amount': formatCurrencyPK(entry.cheque_amount),
      'Bank': bankMap[entry.bank_code] || entry.bank_code,
      'Supplier': supplierMap[entry.supplier_code] || entry.supplier_code,
      'Particulars': entry.particulars,
    }));
  
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Diary Vouchers');
    XLSX.writeFile(wb, 'Diary_Voucher_List.xlsx');
  };
  
  const exportFilteredCSV = () => {
    const formattedData = currentItems.map((entry, index) => ({
      '#': indexOfFirstItem + index + 1,
      'Issue Date': entry.issue_date?.split('T')[0],
      'Cheque Date': entry.cheque_date?.split('T')[0],
      'Cheque No.': entry.cheque_no,
      'Amount': formatCurrencyPK(entry.cheque_amount),
      'Bank': bankMap[entry.bank_code] || entry.bank_code,
      'Supplier': supplierMap[entry.supplier_code] || entry.supplier_code,
      'Particulars': entry.particulars,
    }));
  
    json2csv(formattedData, (err, csv) => {
      if (err) {
        console.error('CSV export failed:', err);
      } else {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', 'Diary_Voucher_List.csv');
        link.click();
      }
    });
  };
  
  const printVoucherList = () => {
    const formattedData = currentItems.map((entry, index) => ({
      '#': indexOfFirstItem + index + 1,
      'Issue Date': entry.issue_date?.split('T')[0],
      'Cheque Date': entry.cheque_date?.split('T')[0],
      'Cheque No.': entry.cheque_no,
      'Amount': formatCurrencyPK(entry.cheque_amount),
      'Bank': bankMap[entry.bank_code] || entry.bank_code,
      'Supplier': supplierMap[entry.supplier_code] || entry.supplier_code,
      'Particulars': entry.particulars,
    }));
  
    const printWindow = window.open('', '', 'height=600,width=800');
    const html = `
      <html>
        <head>
          <title>Diary Voucher List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Diary Voucher List</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Issue Date</th>
                <th>Cheque Date</th>
                <th>Cheque No.</th>
                <th>Amount</th>
                <th>Bank</th>
                <th>Supplier</th>
                <th>Particulars</th>
              </tr>
            </thead>
            <tbody>
              ${formattedData
                .map(row => `
                  <tr>
                    <td>${row['#']}</td>
                    <td>${row['Issue Date']}</td>
                    <td>${row['Cheque Date']}</td>
                    <td>${row['Cheque No.']}</td>
                    <td>${row['Amount']}</td>
                    <td>${row['Bank']}</td>
                    <td>${row['Supplier']}</td>
                    <td>${row['Particulars']}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };
  
  if (loading) return <div className="flex justify-center items-center h-screen">
  <div className="flex space-x-2">
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
  </div>
</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Diary Vouchers</h2>
        <button
          onClick={() => router.push('/Pages/Dashboard/Vouchers/Dairy/creatDairyVoucher')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Create New
        </button>
      </div>
      <div className='flex justify-between py-4 items-center '>
      <div className="flex gap-2 mb-4">
  <button onClick={exportFilteredCSV} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">CSV</button>
  <button onClick={exportVoucherData} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">Excel</button>
  <button onClick={exportToPDF} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">PDF</button>
  <button onClick={printVoucherList} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">Print</button>
</div>
<div className="mb-4">
  <input
    type="text"
    placeholder="Search by bank, supplier, or date..."
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
  />
</div>
      </div>
    

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-500 text-white">
            <tr className=''>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">#</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Issue Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Cheque Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Cheque No.</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Bank</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Supplier</th>
              <th className="px-4 py-2 text-left text-xs font-semibold  uppercase">Particulars</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((entry, index) => (
              <tr key={entry.id || index} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm text-gray-700">{indexOfFirstItem + index + 1}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.issue_date?.split('T')[0]}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_date?.split('T')[0]}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{entry.cheque_no}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{formatCurrencyPK(entry.cheque_amount)}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{bankMap[entry.bank_code] || entry.bank_code}</td>
<td className="px-4 py-2 text-sm text-gray-700">{supplierMap[entry.supplier_code] || entry.supplier_code}</td>

                <td className="px-4 py-2 text-sm text-gray-700">{entry.particulars}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {totalItems} entries
        </span>
        <div className="flex space-x-2 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Prev Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded ${
                index + 1 === currentPage ? 'bg-blue-500 text-white' : 'border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
            disabled={currentPage === totalPages}
          >
 <span className="sr-only">Next Page</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>          </button>
        </div>
      </div>
    </div>
  );
}

export default Diary;
