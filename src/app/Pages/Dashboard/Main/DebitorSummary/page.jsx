'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';

function DebtorSummary() {
  const [partyOptions, setPartyOptions] = useState([]);
  const [includedParties, setIncludedParties] = useState([]);
  const [excludedParties, setExcludedParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredParties, setFilteredParties] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [allParties, setAllParties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partiesRes = await axios.get('https://accounts-management.onrender.com/common/parties/getAll');
        const parties = partiesRes.data || [];

        setPartyOptions(parties.map(p => ({ value: p.party_code, label: p.name })));
        setAllParties(parties);
        setFilteredParties(parties);

        const fetchVoucherDetailsInBatches = async (parties, batchSize = 50) => {
          const allVoucherDetails = [];
          for (let i = 0; i < parties.length; i += batchSize) {
            const batch = parties.slice(i, i + batchSize);
            const results = await Promise.allSettled(
              batch.map(party =>
                axios.get(`https://accounts-management.onrender.com/common/voucherDetail/mains/${party.party_code}`)
              )
            );

            results.forEach((result, index) => {
              if (result.status === 'fulfilled' && Array.isArray(result.value.data)) {
                allVoucherDetails.push(...result.value.data);
              } else {
                const failedParty = batch[index];
                console.error(`Failed to fetch voucher details for party ${failedParty.party_code}:`, result.reason);
              }
            });
          }
          return allVoucherDetails;
        };

        const allVoucherDetails = await fetchVoucherDetailsInBatches(parties);
        setVoucherDetails(allVoucherDetails);

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

  const handleSearch = () => {
    const includedIds = includedParties.map(p => p.value);
    const excludedIds = excludedParties.map(p => p.value);

    const filtered = allParties.filter(party => {
      const included = includedIds.length === 0 || includedIds.includes(party.party_code);
      const excluded = excludedIds.length === 0 || !excludedIds.includes(party.party_code);
      return included && excluded;
    });

    setFilteredParties(filtered);
  };

  const handleReset = () => {
    setIncludedParties([]);
    setExcludedParties([]);
    setFilteredParties(allParties);
  };

  // constgetLatestParticularsByAccountCode = (accountCode) => {
  //   const filtered = voucherDetails.filter(v => v.account_code === accountCode && v.voucher_type === 'JV');
  //   const sorted = filtered.sort((a, b) => b.main_id - a.main_id);
  //   return sorted[0]?.particulars || '';
  // };
const getLatestParticularsByAccountCode = (accountCode) => {
  const filtered = voucherDetails.filter(v => v.account_code === accountCode);
  const sorted = filtered.sort((a, b) => new Date(b.voucher_date) - new Date(a.voucher_date));
  return sorted[0]?.particulars || '';
};


  const getCurrentBalance = (accountCode) => {
    const entries = voucherDetails.filter(v => v.account_code === accountCode);
    const totalDebit = entries.reduce((sum, e) => sum + Number(e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + Number(e.credit || 0), 0);
    return totalDebit - totalCredit;
  };

  const getLatestVoucher = (accountCode) => {
    return voucherDetails.find(v => v.account_code === accountCode && v.voucher_type === 'JV');
  };
const tableRef = useRef();

const exportToExcel = () => {
  const data = filteredParties.map((party, idx) => ({
    '#': idx + 1,
    'Party Code': party.party_code,
    'Party Name': party.name,
    'Particulars':getLatestParticularsByAccountCode(party.party_code),
    'Amount': getCurrentBalance(party.party_code),
    'Status': getCurrentBalance(party.party_code) < 0 ? 'Cr' : 'Dr'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Debtors');
  XLSX.writeFile(wb, 'Debtor_Summary.xlsx');
};

const exportToCSV = () => {
  const data = filteredParties.map((party, idx) => ({
    '#': idx + 1,
    'Party Code': party.party_code,
    'Party Name': party.name,
    'Particulars':getLatestParticularsByAccountCode(party.party_code),
    'Amount': getCurrentBalance(party.party_code),
    'Status': getCurrentBalance(party.party_code) < 0 ? 'Cr' : 'Dr'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Debtors');
  XLSX.writeFile(wb, 'Debtor_Summary.csv', { bookType: 'csv' });
};

const exportToPDF = () => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['#', 'Party Code', 'Party Name', 'Particulars', 'Amount', 'Status']],
    body: filteredParties.map((party, idx) => [
      idx + 1,
      party.party_code,
      party.name,
     getLatestParticularsByAccountCode(party.party_code),
      getCurrentBalance(party.party_code),
      getCurrentBalance(party.party_code) < 0 ? 'Cr' : 'Dr'
    ]),
  });
  doc.save('Debtor_Summary.pdf');
};

const handlePrint = () => {
  const headerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Debitor Summary</h2>
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
const searchedParties = filteredParties.filter((party) => {
  const balance = getCurrentBalance(party.party_code);
  const status = balance < 0 ? 'Cr' : 'Dr';
  const particulars =getLatestParticularsByAccountCode(party.party_code);

  return (
    party.name.toLowerCase().includes(searchQuery) ||
    party.party_code.toLowerCase().includes(searchQuery) ||
    particulars.toLowerCase().includes(searchQuery) ||
    balance.toString().toLowerCase().includes(searchQuery) ||
    status.toLowerCase().includes(searchQuery)
  );
});

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Debtor Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Included Parties</label>
          <Select className='mt-2' isMulti options={partyOptions} value={includedParties} onChange={setIncludedParties} />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Parties</label>
          <Select className='mt-2' isMulti options={partyOptions} value={excludedParties} onChange={setExcludedParties} />
        </div>
      </div>

      <div className="mt-4">
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        <button onClick={handleReset} className="ml-2 bg-red-600 text-white px-4 py-2 rounded">Reset</button>
      </div>

      <div className="overflow-x-auto mt-6 bg-white shadow-md rounded">
        <div className='flex justify-between items-center mb-6'>
  <div className="mt-6 flex flex-wrap gap-2">
  <button onClick={exportToExcel} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Export Excel</button>
  <button onClick={exportToCSV} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Export CSV</button>
  <button onClick={exportToPDF} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Export PDF</button>
  <button onClick={handlePrint} className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded">Print</button>
</div>
<div className="mt-6">
  <input
    type="text"
    placeholder="Search anything..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
    className="px-4 py-2 border rounded-md w-full"
  />
</div>

        </div>
      

        <table ref={tableRef} className="min-w-full table-auto">
          <thead className="bg-gray-100 text-sm font-semibold text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Party Code</th>
              <th className="px-4 py-2">Party Name</th>
              <th className="px-4 py-2">Particulars</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {searchedParties.map((party, idx) => {
              const particulars = getLatestParticularsByAccountCode(party.party_code);
              const balance = getCurrentBalance(party.party_code);
              const latestJVVoucher = getLatestVoucher(party.party_code);

              return (
                <tr key={party.party_code} className="border-b">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{party.party_code || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <Link className="text-blue-600" href={`/Pages/Dashboard/Ledger/${party.party_code}`}>
                      {party.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{particulars}</td>
                  <td className="px-4 py-2 font-medium">{balance.toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium">{balance < 0 ? 'Cr' : 'Dr'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DebtorSummary;
