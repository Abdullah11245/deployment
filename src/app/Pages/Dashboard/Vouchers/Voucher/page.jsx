'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {

      try {
        const [voucherRes, detailRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/voucher/getAll'),
          axios.get('https://accounts-management.onrender.com/common/voucherDetail/getAll'),
        ]);

        setVouchers(voucherRes.data || []);
        console.log(voucherRes)
        setVoucherDetails(detailRes.data || []);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    
    fetchData();
  }, []);



  const handleEdit = (voucher) => {
    router.push(`/Pages/Dashboard/Vouchers/Voucher/${voucher.id}`);
  };

  const handleCreateNew = (route) => {
    router.push(`/Pages/Dashboard/Vouchers/Voucher/Create${route}`);
  };

  const getDetailsForVoucher = (voucherId) =>
    voucherDetails.filter((detail) => detail.main_id === voucherId);

  const getTotalDebit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);

  const getTotalCredit = (details) =>
    details.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);
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
else{
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Vouchers</h2>
        <div className='flex justify-between space-x-2 items-center'>
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

      <div className='flex justify-between items-center'>
        <div className=" flex justify-between items-center space-x-1 mt-8 mb-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Archive
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Delete
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Restore
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md">
            Add
          </button>
        </div>

        <div className="relative text-gray-600 border-2 rounded-full">
          <input
            type="search"
            name="search"
            placeholder="Search"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entries</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Debit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Credit</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {vouchers.length > 0 ? (
              vouchers.map((voucher, index) => {
                const details = getDetailsForVoucher(voucher.id);
                const totalDebit = getTotalDebit(details);
                const totalCredit = getTotalCredit(details);

                return (
                  <tr key={voucher.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{voucher.voucher_type}-{voucher.voucher_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(voucher.voucher_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{voucher.note}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{details.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalDebit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{totalCredit.toFixed(2)}</td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="relative">
                      <button
    onClick={() => handleEdit(voucher)}
    className="bg-gray-200 text-white p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
  >
  <svg viewBox="0 0 24 24" fill="none" width='25px' height='25px' ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997V7.93997Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>

  </button>
                        
                      </div>
                    </td> */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center px-6 py-4 text-sm text-gray-700">
                  No voucher data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
};

export default VoucherList;
