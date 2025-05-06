'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { json2csv } from 'json-2-csv';


const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const itemsPerPage = 200;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voucherRes, detailRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll', { headers: { 'Access-Control-Allow-Origin': '*' } })
        ]);
        setVouchers(voucherRes.data || []);
        setVoucherDetails(detailRes.data || []);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateNew = (route) => {
    router.push(`/Pages/Dashboard/Vouchers/Voucher/Create${route}`);
  };

  const getDetailsForVoucher = (voucherId) => 
    voucherDetails.filter((detail) => detail.main_id === voucherId);

  const getTotalDebit = (details) => 
    details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);

  const getTotalCredit = (details) => 
    details.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);

  // Handle pagination logic after filtering
  const filteredVouchers = vouchers.filter((voucher) => {
    const details = getDetailsForVoucher(voucher.id);

    // Check if voucher ID, voucher type, or particulars match the search query
    const voucherIdMatch = voucher.voucher_id.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const voucherTypeMatch = voucher.voucher_type.toLowerCase().includes(searchQuery.toLowerCase());
    const particularsMatch = details.some((detail) =>
      detail.particulars && detail.particulars.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    return voucherIdMatch || voucherTypeMatch || particularsMatch;
  });

  // Paginate filtered vouchers
  const indexOfLastVoucher = currentPage * itemsPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - itemsPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatCurrencyPK = (number) => {
    if (isNaN(number)) return '0';
    const rounded = Math.round(Number(number));
    return rounded.toLocaleString('en-IN');
  };

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
    else if(voucher_type == 'DV'){
      return `/Pages/Dashboard/Vouchers/Voucher`
    }
    else {
      return `/Pages/Dashboard/Vouchers/Voucher/${voucher_type}/${id}/${voucher_id}`;
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const exportToPDF = () => {
    const filteredVoucherData = currentVouchers.map((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      const totalDebit = getTotalDebit(details);
      const totalCredit = getTotalCredit(details);
      return {
        '#': index + 1,
        'Voucher Type': `${voucher.voucher_type}-${voucher.voucher_id}`,
        'Voucher Date': new Date(voucher.voucher_date).toLocaleDateString(),
        'Particulars': details.map(d => d.particulars).join(', '),
        'Total Debit': formatCurrencyPK(totalDebit),
        'Total Credit': formatCurrencyPK(totalCredit),
      };
    });

    const doc = new jsPDF();
    doc.autoTable({
      head: [['#', 'Voucher Type', 'Voucher Date', 'Particulars', 'Total Debit', 'Total Credit']],
      body: filteredVoucherData.map(item => [
        item['#'],
        item['Voucher Type'],
        item['Voucher Date'],
        item['Particulars'],
        item['Total Debit'],
        item['Total Credit'],
      ]),
    });
    doc.save('Voucher_List.pdf');
  };

  const exportFilteredCSV = () => {
    const filteredVoucherData = currentVouchers.map((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      const totalDebit = getTotalDebit(details);
      const totalCredit = getTotalCredit(details);
      return {
        '#': index + 1,
        'Voucher Type': `${voucher.voucher_type}-${voucher.voucher_id}`,
        'Voucher Date': new Date(voucher.voucher_date).toLocaleDateString(),
        'Particulars': details.map(d => d.particulars).join(', '),
        'Total Debit': formatCurrencyPK(totalDebit),
        'Total Credit': formatCurrencyPK(totalCredit),
      };
    });

    json2csv(filteredVoucherData, (err, csv) => {
      if (err) {
        console.error('Error converting to CSV:', err);
      } else {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', 'Voucher_List.csv');
        link.click();
      }
    });
  };

  const exportVoucherData = () => {
    const filteredVoucherData = currentVouchers.map((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      const totalDebit = getTotalDebit(details);
      const totalCredit = getTotalCredit(details);
      return {
        '#': index + 1,
        'Voucher Type': `${voucher.voucher_type}-${voucher.voucher_id}`,
        'Voucher Date': new Date(voucher.voucher_date).toLocaleDateString(),
        'Particulars': details.map(d => d.particulars).join(', '),
        'Total Debit': formatCurrencyPK(totalDebit),
        'Total Credit': formatCurrencyPK(totalCredit),
      };
    });

    const ws = XLSX.utils.json_to_sheet(filteredVoucherData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Voucher List');
    XLSX.writeFile(wb, 'Voucher_List.xlsx');
  };

  const printVoucherList = () => {
    const filteredVoucherData = currentVouchers.map((voucher, index) => {
      const details = getDetailsForVoucher(voucher.id);
      const totalDebit = getTotalDebit(details);
      const totalCredit = getTotalCredit(details);
      return {
        '#': index + 1,
        'Voucher Type': `${voucher.voucher_type}-${voucher.voucher_id}`,
        'Voucher Date': new Date(voucher.voucher_date).toLocaleDateString(),
        'Particulars': details.map(d => d.particulars).join(', '),
        'Total Debit': formatCurrencyPK(totalDebit),
        'Total Credit': formatCurrencyPK(totalCredit),
      };
    });

    const printWindow = window.open('', '', 'height=600,width=800');
    const documentContent = `
      <html>
        <head>
          <title>Voucher List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            table, th, td { border: 1px solid black; }
            th, td { padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Voucher List</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Voucher Type</th>
                <th>Voucher Date</th>
                <th>Particulars</th>
                <th>Total Debit</th>
                <th>Total Credit</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVoucherData
                .map(item => {
                  return `
                    <tr>
                      <td>${item['#']}</td>
                      <td>${item['Voucher Type']}</td>
                      <td>${item['Voucher Date']}</td>
                      <td>${item['Particulars']}</td>
                      <td>${item['Total Debit']}</td>
                      <td>${item['Total Credit']}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(documentContent);
    printWindow.document.close();
    printWindow.print();
  };

 
  
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
        <h2 className="text-xl font-semibold text-gray-700">List of Vouchers</h2>
        <div className="flex justify-between space-x-2 items-center">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={() => { handleCreateNew('CP_CR') }}
          >
            Create CP CR
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={() => { handleCreateNew('BP_BR') }}
          >
            Create BP BR
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={() => { handleCreateNew('JV_BRV') }}
          >
            Create JV BRV
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 mb-4">
      <div className="flex gap-2 mb-6">
    <button onClick={exportFilteredCSV} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">CSV</button>
    <button onClick={exportVoucherData} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">Excel</button>
    <button onClick={exportToPDF} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">PDF</button>
    <button onClick={printVoucherList} className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md">Print</button>
  </div>
        <div className="relative text-gray-600 border-2 rounded-full">
          <input
            type="search"
            name="search"
            placeholder="Search by Voucher ID, Type, or Particulars"
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
          />
          <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              id="Capa_1"
              x="0px"
              y="0px"
              viewBox="0 0 56.966 56.966"
              style={{ enableBackground: 'new 0 0 56.966 56.966' }}
              xmlSpace="preserve"
              width="512px"
              height="512px"
            >
              <path
                d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23 s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92 c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17 s-17-7.626-17-17S14.61,6,23.984,6z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Debit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Credit</th>
            </tr>
          </thead>
          <tbody>
            {currentVouchers.length > 0 ? (
              currentVouchers.map((voucher, index) => {
                const details = getDetailsForVoucher(voucher.id);
                const totalDebit = getTotalDebit(details);
                const totalCredit = getTotalCredit(details);

                return (
                  <tr key={voucher.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <Link
                        className='hover:bg-gray-100 px-6 py-3'
                        href={getVoucherLink(voucher)}
                      >
                        {voucher.voucher_type}-{voucher.voucher_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(voucher.voucher_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {details.map((d, i) => (<p key={i}>{d.particulars}</p>))}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-700">{formatCurrencyPK(totalDebit)}</td>
                    <td className="px-6 py-4 text-base text-gray-700">{formatCurrencyPK(totalCredit)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center px-6 py-4 text-sm text-gray-700">
                  No voucher data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-semibold text-gray-700">
          Showing {indexOfFirstVoucher + 1} to {Math.min(indexOfLastVoucher, filteredVouchers.length)} of {filteredVouchers.length} entries
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

          {[...Array(Math.ceil(filteredVouchers.length / itemsPerPage))].map((_, idx) => (
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
            disabled={currentPage === Math.ceil(filteredVouchers.length / itemsPerPage)}
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
};

export default VoucherList;
