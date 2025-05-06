
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';

function Receiptreport() {
  const [routes, setRoutes] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
 
  const [partiesOptions, setPartiesOptions] = useState([]);
  const [banksOptions, setBanksOptions] = useState([]);
  const [originalRoutes, setOriginalRoutes] = useState([]);
  const [originalVoucherDetails, setOriginalVoucherDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(200);
  const tableRef = useRef(null);
  const [partyNameMap, setPartyNameMap] = useState({});
   const [voucherData, setVoucherData] = useState([]);
   
    const [includedSuppliers, setIncludedSuppliers] = useState([]);
    const [excludedSuppliers, setExcludedSuppliers] = useState([]);
    const [includedRoutes, setIncludedRoutes] = useState([]);
    const [excludedRoutes, setExcludedRoutes] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [routeOptions, setRouteOptions] = useState([]);
   
    const [filteredData, setFilteredData] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes, partiesRes, banksRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll'),
          axios.get('https://accounts-management.onrender.com/common/parties/getAll'),
          axios.get('https://accounts-management.onrender.com/common/banks/getAll')
        ]);
         console.log(voucherRes.data)
        console.log(detailRes.data)
        const voucherData = voucherRes.data || [];
        const detailData = detailRes.data || [];
  
        // Map account_code to name
        const uniqueCodes = [...new Set(detailData.map(d => d.account_code))];
        const partyNameMap = {};
  
        await Promise.all(
          uniqueCodes.map(async (code) => {
            try {
              const res = await axios.get(`https://accounts-management.onrender.com/common/parties/partybyCode/${code}`);
              if (res.data?.name) {
                partyNameMap[code] = res.data.name;
              }
            } catch (err) {
              
            }
          })
        );
  
        setPartyNameMap(partyNameMap);
        setRoutes(voucherData);
        setVoucherDetails(detailData);
        setOriginalRoutes(voucherData);
        setOriginalVoucherDetails(detailData);
  
        const activeParties = partiesRes.data.filter(party => party.status);
        setPartiesOptions(
          activeParties.map(party => ({ value: party.party_code, label: party.name }))
        );
  
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
        
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  const getDetailsForVoucher = (voucherId) => {
    return voucherDetails.filter(detail => detail.main_id === voucherId);
  };

  const getTotalDebit = (details) => {
    return details.reduce((sum, detail) => sum + (parseFloat(detail.debit) || 0), 0);
  };

  const getPaginatedData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return routes.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(routes.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    const includedSupplierIds = includedSuppliers.map(s => s.value);
    const excludedSupplierIds = excludedSuppliers.map(s => s.value);
    const includedRouteNames = includedRoutes.map(r => r.label);
    const excludedRouteNames = excludedRoutes.map(r => r.label);

    const filtered = voucherData.filter(voucher => {
      const voucherDate = new Date(voucher.voucher_date);
      const isAfterStart = startDate ? voucherDate >= new Date(startDate) : true;
      const isBeforeEnd = endDate ? voucherDate <= new Date(endDate) : true;

      const isWithinDate = isAfterStart && isBeforeEnd;

      const supplierIncluded = includedSupplierIds.length === 0 || voucher.details.some(d => includedSupplierIds.includes(d.supplier_id));
      const supplierExcluded = excludedSupplierIds.length === 0 || voucher.details.every(d => !excludedSupplierIds.includes(d.supplier_id));

      const routeIncluded = includedRouteNames.length === 0 || voucher.details.some(d => includedRouteNames.includes(d.route_name));
      const routeExcluded = excludedRouteNames.length === 0 || voucher.details.every(d => !excludedRouteNames.includes(d.route_name));

      return isWithinDate && supplierIncluded && supplierExcluded && routeIncluded && routeExcluded;
    });

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setIncludedSuppliers([]);
    setExcludedSuppliers([]);
    setIncludedRoutes([]);
    setExcludedRoutes([]);
    setFilteredData(voucherData);
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
      const csv = await json2csv(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'receipt_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
     
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

  const totalPages = Math.ceil(routes.length / itemsPerPage);
  const indexOfFirstRoute = (currentPage - 1) * itemsPerPage;
  const indexOfLastRoute = Math.min(indexOfFirstRoute + itemsPerPage, routes.length);

  return (
    <div className="container mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
      <h2 className="text-xl font-semibold text-gray-700">Receipt Report</h2>
    </div>

    {/* Filters */}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Included Suppliers</label>
          <Select
            options={supplierOptions}
            value={includedSuppliers}
            onChange={setIncludedSuppliers}
            isMulti
            placeholder="Select Suppliers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Excluded Suppliers</label>
          <Select
            options={supplierOptions}
            value={excludedSuppliers}
            onChange={setExcludedSuppliers}
            isMulti
            placeholder="Select Excluded Suppliers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Included Routes</label>
          <Select
            options={routeOptions}
            value={includedRoutes}
            onChange={setIncludedRoutes}
            isMulti
            placeholder="Select Routes"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Excluded Routes</label>
          <Select
            options={routeOptions}
            value={excludedRoutes}
            onChange={setExcludedRoutes}
            isMulti
            placeholder="Select Excluded Routes"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="ml-3 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset
        </button>
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
    <div ref={tableRef} className="overflow-x-auto bg-white shadow-lg rounded-lg mt-4">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="text-sm font-semibold bg-gray-100">
            <th className="py-3 px-4 text-left">#</th>
            <th className="py-3 px-4 text-left">Voucher</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Party</th>
            <th className="py-3 px-4 text-left">Nature/Mode</th>
            <th className="py-3 px-4 text-left">Particulars</th>
            <th className="py-3 px-4 text-left">Amount</th>
            <th className="py-3 px-4 text-left">Note</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedData().map((route, index) => {
            const details = getDetailsForVoucher(route.id);
            return (
              <tr key={route.id} className="text-sm text-gray-700">
                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="py-3 px-4">{route.voucher_type}-{route.voucher_id}</td>
                <td className="py-3 px-4">{new Date(route.voucher_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
  {(() => {
    const details = getDetailsForVoucher(route.id);
    const matchedParty = details.find(detail => partyNameMap[detail.account_code]);
    return matchedParty ? partyNameMap[matchedParty.account_code] : 'N/A';
  })()}
</td>

                <td className="py-3 px-4">{route.voucher_type}</td>
                <td className="py-3 px-4 ">
  {getDetailsForVoucher(route.id).map((detail, idx) => (
    <div key={idx}>{detail.particulars}</div>
  ))}
</td>

                <td className="py-3 px-4">{getTotalDebit(details).toFixed(2)}</td>
                <td className="py-3 px-4">{route.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Pagination Controls */}
    <div className="flex justify-between items-center mt-8">
      <span className="text-sm font-semibold text-gray-700">
        Showing {indexOfFirstRoute + 1} to {Math.min(indexOfLastRoute, routes.length)} of {routes.length} entries
      </span>

      <ol className="flex gap-1 text-xs font-medium">
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900"
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
        </li>

        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i}>
            <button
              onClick={() => handlePageChange(i + 1)}
              className={`block w-8 h-8 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-900'} text-center leading-8`}
            >
              {i + 1}
            </button>
          </li>
        ))}

        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center justify-center rounded border w-8 h-8 border-gray-300 bg-white text-gray-900"
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
        </li>
      </ol>
    </div>
  </div>
  );
}

export default Receiptreport;
