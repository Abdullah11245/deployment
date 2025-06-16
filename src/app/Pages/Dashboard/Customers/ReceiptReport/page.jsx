
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';
import end_points from '../../../../api_url';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(200);
  const tableRef = useRef(null);
  const [partyNameMap, setPartyNameMap] = useState({});
  const [resolvedBanks, setResolvedBanks] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes, partiesRes, banksRes] = await Promise.all([
          axios.get(`${end_points}/voucher/getAll`),
          axios.get(`${end_points}/voucherDetail/getAll`),
          axios.get(`${end_points}/suppliers/getAll`),
          axios.get(`${end_points}/banks/getAll`)
        ]);
  
        const voucherData = voucherRes.data || [];
        const detailData = detailRes.data || [];
        const uniqueCodes = [...new Set(detailData.map(d => d.account_code))];
        const partyNameMap = {};
  
        await Promise.all(
          uniqueCodes.map(async (code) => {
            try {
              // Try fetching supplier first
              const supplierRes = await axios.get(`${end_points}/suppliers/supplier/${code}`);
              if (supplierRes.data?.name) {
                partyNameMap[code] = supplierRes.data.name;
              }
            } catch (err) {
              // Supplier not found, try fetching party instead
              try {
                const partyRes = await axios.get(`${end_points}/parties/partybyCode/${code}`);
                if (partyRes.data?.name) {
                  partyNameMap[code] = partyRes.data.name;
                }
              } catch (partyErr) {
                
              }
            }
          })
        );
        const brVouchers = voucherData.filter(v => v.voucher_type === 'BR' || v.voucher_type =='JV');
        setRoutes(brVouchers);
        setOriginalRoutes(brVouchers);
        setPartyNameMap(partyNameMap);
        setVoucherDetails(detailData);
        setOriginalVoucherDetails(detailData);
  
        // Party Options
        const activeParties = partiesRes.data.suppliers.filter(party => party.status);
        setPartiesOptions(
          activeParties.map(party => ({ value: party.supplier_code, label: party.name }))
        );
  
        // Bank Options
        const banksData = banksRes.data;
        const banksOptions = [
          { value: 'All', label: 'All' },
          ...banksData.map(bank => ({
            value: bank.account_code,
            label: bank.account_title
          })),
          { value: 'Cash', label: 'Cash' }
        ];
        setBanksOptions(banksOptions);
  
        const bankNameMap = {};
        banksData.forEach(bank => {
          bankNameMap[bank.account_title.toLowerCase()] = bank.account_title;
        });
        setResolvedBanks(bankNameMap);
  
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  


  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };

  const getDetailsForVoucher = (voucherId) => {
    return voucherDetails.filter(detail => detail.main_id === voucherId);
  };

  const getTotalDebit = (details) => {
    return details.reduce((sum, detail) => sum + (parseFloat(detail.debit) || 0), 0);
  };
 
  const processParticulars = (text) => {
    if (typeof text !== 'string' || !text.trim()) {
      return { nature: '' };
    }
  
    const lowerText = text.toLowerCase();
    let nature = '';
  
    // Handle "from" keyword
    const fromIndex = lowerText.indexOf('from');
    if (fromIndex !== -1) {
      nature = text.substring(fromIndex + 5).trim(); // Text after "from"
    }
  
    // Handle "into" keyword
    const intoIndex = lowerText.indexOf('into');
    if (intoIndex !== -1) {
      nature = text.substring(intoIndex + 5).trim(); // Text after "into"
    }
  
    // Handle ":" (colon) keyword
    const colonIndex = lowerText.indexOf(':');
    if (colonIndex !== -1) {
      nature = text.substring(colonIndex + 1).trim(); // Text after ":"
    }
  
    return { nature };
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
      const selectedPartyCodes = selectedParty.map(p => p.value); // assuming label contains supplier_code
  
      filteredData = filteredData.filter(route => {
        const details = getDetailsForVoucher(route.id);
        return details.some(detail => selectedPartyCodes.includes(detail.account_code));
      });
    }
  
    if (selectedCashBank.length > 0 && !selectedCashBank.some(item => item.value === 'All')) {
      filteredData = filteredData.filter(route =>
        selectedCashBank.some(bank => {
          const details = getDetailsForVoucher(route.id);
          const bankTitles = details.map(detail => processParticulars(detail?.particulars).nature);
          return bankTitles.some(nature => {
            return selectedCashBank.some(bankOption => {
              const bankTitle = bankOption.label.toLowerCase();
              return nature.toLowerCase().includes(bankTitle); // Match if the bank title is part of the nature
            });
          });
        })
      );
    }
  
    setRoutes(filteredData);
    setCurrentPage(1);
  };
  
  

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedParty([]);
    setSelectedCashBank([]);
    setRoutes(originalRoutes);
    setCurrentPage(1);
  };

  const exportCSV = async () => {
    const dataToExport = routes.map((route, index) => {
      const details = getDetailsForVoucher(route.id);
      return {
        '#': index + 1,
        'Voucher': route.voucher_id,
        'Date': new Date(route.voucher_date).toLocaleDateString(),
        'Party':  (() => {
  const details = getDetailsForVoucher(route.id);
  const matchedParty = details.find(detail => partyNameMap[detail.account_code]);
  return matchedParty ? partyNameMap[matchedParty.account_code] : 'N/A';
})(),
        'Nature/Mode':(() => {
  const details = getDetailsForVoucher(route.id);
  for (let detail of details) {
    const { nature } = processParticulars(detail?.particulars);
    const matchedBank = Object.keys(resolvedBanks).find(bankKey =>
      nature.toLowerCase().includes(bankKey)
    );
    if (matchedBank) {
      return resolvedBanks[matchedBank];
    }
  }
  return 'N/A';
})(),
        'Particulars': (() => {
  const details = getDetailsForVoucher(route.id);
  return details.length > 0 ? details[0].particulars : 'N/A';
})(),
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
        'Voucher': route.voucher_id,
        'Date': new Date(route.voucher_date).toLocaleDateString(),
        'Party':  (() => {
  const details = getDetailsForVoucher(route.id);
  const matchedParty = details.find(detail => partyNameMap[detail.account_code]);
  return matchedParty ? partyNameMap[matchedParty.account_code] : 'N/A';
})(),
        'Nature/Mode':(() => {
  const details = getDetailsForVoucher(route.id);
  for (let detail of details) {
    const { nature } = processParticulars(detail?.particulars);
    const matchedBank = Object.keys(resolvedBanks).find(bankKey =>
      nature.toLowerCase().includes(bankKey)
    );
    if (matchedBank) {
      return resolvedBanks[matchedBank];
    }
  }
  return 'N/A';
})(),
        'Particulars': (() => {
  const details = getDetailsForVoucher(route.id);
  return details.length > 0 ? details[0].particulars : 'N/A';
})(),
        'Amount': (() => {
  const details = getDetailsForVoucher(route.id);
  return getTotalDebit(details).toFixed(2);
})(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReceiptReport');
    XLSX.writeFile(workbook, 'receipt_report.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['#', 'Voucher', 'Date', 'Party', 'Nature/Mode', 'Particulars', 'Amount'];
    const tableRows = [];

    routes.forEach((route, index) => {
      const details = getDetailsForVoucher(route.id);
      tableRows.push([
        index + 1,
        route.voucher_id,
        new Date(route.voucher_date).toLocaleDateString(),
       (() => {
  const details = getDetailsForVoucher(route.id);
  const matchedParty = details.find(detail => partyNameMap[detail.account_code]);
  return matchedParty ? partyNameMap[matchedParty.account_code] : 'N/A';
})(),

      (() => {
  const details = getDetailsForVoucher(route.id);
  for (let detail of details) {
    const { nature } = processParticulars(detail?.particulars);
    const matchedBank = Object.keys(resolvedBanks).find(bankKey =>
      nature.toLowerCase().includes(bankKey)
    );
    if (matchedBank) {
      return resolvedBanks[matchedBank];
    }
  }
  return 'N/A';
})(),
        (() => {
  const details = getDetailsForVoucher(route.id);
  return details.length > 0 ? details[0].particulars : 'N/A';
})(),
(() => {
  const details = getDetailsForVoucher(route.id);
  return getTotalDebit(details).toFixed(2);
})(),

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
 const handleUniversalSearch = (searchTerm) => {
  if (!searchTerm.trim()) {
    setRoutes(originalRoutes);
    setCurrentPage(1);
    return;
  }

  const lowerSearch = searchTerm.toLowerCase();

  const filtered = originalRoutes.filter(route => {
    const voucherId = route.voucher_id?.toString().toLowerCase() || '';
    const voucherType = route.voucher_type?.toLowerCase() || '';
    const voucherDate = new Date(route.voucher_date).toLocaleDateString().toLowerCase();
    const note = route.note?.toLowerCase() || '';

    const details = getDetailsForVoucher(route.id);

    const particularsMatch = details.some(detail =>
      (detail.particulars || '').toLowerCase().includes(lowerSearch)
    );

    const partyMatch = details.some(detail => {
      const partyName = partyNameMap[detail.account_code]?.toLowerCase() || '';
      return partyName.includes(lowerSearch);
    });

    const bankMatch = details.some(detail => {
      const { nature } = processParticulars(detail?.particulars);
      return Object.keys(resolvedBanks).some(bankKey =>
        nature.toLowerCase().includes(bankKey) && bankKey.includes(lowerSearch)
      );
    });

    return (
      voucherId.includes(lowerSearch) ||
      voucherType.includes(lowerSearch) ||
      voucherDate.includes(lowerSearch) ||
      note.includes(lowerSearch) ||
      particularsMatch ||
      partyMatch ||
      bankMatch
    );
  });

  setRoutes(filtered);
  setCurrentPage(1);
};

  
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
          className="mt-2 text-black"
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
          className="mt-2 text-black"
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
      <div className=''>

      <input
  type="text"
  placeholder="Search..."
  onChange={(e) => handleUniversalSearch(e.target.value)}
  className="px-3 py-2 border rounded-md text-sm w-64 text-black"
/>
      </div>

    </div>

    {/* Table */}
    <div ref={tableRef} className="overflow-x-auto bg-white shadow-lg rounded-lg mt-4">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="text-sm font-semibold bg-gray-500 text-white ">
            <th className="py-3 px-4 text-left">#</th>
            <th className="py-3 px-4 text-left">Voucher</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Party</th>
            <th className="py-3 px-4 text-left">Nature/Mode</th>
            <th className="py-3 px-4 text-left">Particulars</th>
            <th className="py-3 px-4 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedData().map((route, index) => {
            const details = getDetailsForVoucher(route.id);
            return (
              <tr key={route.id} className="text-sm text-gray-700 hover:bg-gray-200">
                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="py-3 px-4">{route.voucher_type}-{route.voucher_id}</td>
                <td className="py-3 px-4">{new Date(route.voucher_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
  {(() => {
    const details = getDetailsForVoucher(route.id);
    const matchedParty = details.find(detail => partyNameMap[detail.account_code]);
  
    return matchedParty ? partyNameMap[matchedParty.account_code] : <div className='text-center'>N/A</div>;
  })()}
</td>

<td className="py-3 px-4">
  {(() => {
    const details = getDetailsForVoucher(route.id);
    for (let detail of details) {
      const { nature } = processParticulars(detail?.particulars);
      const matchedBank = Object.keys(resolvedBanks).find(bankKey =>
        nature.toLowerCase().includes(bankKey)
      );
      if (matchedBank) {
        return resolvedBanks[matchedBank];
      }
    }
    return 'N/A';
  })()}
</td>



         <td className="py-3 px-4 w-72">
  {(() => {
    const details = getDetailsForVoucher(route.id);
    return details.length > 0 ? details[0].particulars : 'N/A';
  })()}
</td>


                <td className="py-3 px-4">{formatCurrencyPK(getTotalDebit(details).toFixed(2))}</td>
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
