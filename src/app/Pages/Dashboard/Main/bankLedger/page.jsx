'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import end_points from '../../../../api_url';
import Link from 'next/link';

const BankList = () => {
  const router = useRouter();
  const [banks, setBanks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const banksPerPage = 10;
  const indexOfLastBank = currentPage * banksPerPage;
  const indexOfFirstBank = indexOfLastBank - banksPerPage;
  const currentBanks = banks.slice(indexOfFirstBank, indexOfLastBank);
  const totalPages = Math.ceil(banks.length / banksPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banksRes, voucherRes, voucherDetailRes] = await Promise.all([
          axios.get(`${end_points}/banks/getAll`),
          axios.get(`${end_points}/voucher/getAll`), // optional for future use
          axios.get(`${end_points}/voucherDetail/getAll`),
        ]);

        const banks = banksRes.data || [];
        const voucherDetails = voucherDetailRes.data || [];

        // Calculate balances for each bank
        const banksWithBalance = banks.map((bank) => {
          const relatedEntries = voucherDetails.filter(
            (detail) => detail.account_code === bank.account_code
          );

          const totalDebit = relatedEntries.reduce(
            (sum, entry) => sum + (parseFloat(entry.debit) || 0),
            0
          );
          const totalCredit = relatedEntries.reduce(
            (sum, entry) => sum + (parseFloat(entry.credit) || 0),
            0
          );

          const balance = totalDebit - totalCredit;

          return { ...bank, balance };
        });

        setBanks(banksWithBalance);
      } catch (error) {
        console.error('Error fetching bank/voucher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateNew = () => {
    router.push('/Pages/Dashboard/BankList/CreateBankList');
  };

  const handleEdit = (bank) => {
    router.push(`/Pages/Dashboard/BankList/${bank.id}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
        <h2 className="text-xl font-semibold text-gray-700">List of Banks</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center"
          onClick={handleCreateNew}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            />
          </svg>
          Create New
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-500">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase">#</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase">
                Account Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentBanks.map((bank, index) => (
              <tr key={bank.id} className="border-t">
                <td className="px-6 py-4 text-sm text-gray-700">{indexOfFirstBank + index + 1}</td>

                <td className="px-6 py-4 text-sm text-gray-700"><Link href={`/Pages/Dashboard/Main/bankLedger/${bank.account_code}`}>{bank?.account_title}</Link></td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  Rs. {bank.balance?.toLocaleString() ?? '0'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`${
                      bank.status === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                    } px-2 py-1 rounded-md text-xs font-semibold`}
                  >
                    {bank.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <button
                    onClick={() => handleEdit(bank)}
                    className="bg-gray-200 p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="20px" height="20px">
                      <path
                        d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997Z"
                        stroke="#000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm font-semibold text-gray-700">
          Showing {banks.length === 0 ? 0 : indexOfFirstBank + 1} to {Math.min(indexOfLastBank, banks.length)} of {banks.length} entries
        </span>

        <ol className="flex gap-1 text-xs font-medium">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page}>
              <button
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded border ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-900'
                } text-center leading-8`}
              >
                {page}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white text-gray-900"
            >
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
};

export default BankList;
