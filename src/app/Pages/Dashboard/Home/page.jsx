'use client'
import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import end_points from '../../../api_url';

const Dashboard = () => {
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [suppliersRes, itemsRes] = await Promise.all([
          fetch(`${end_points}/suppliers/getAll`),
          fetch(`${end_points}/items/getAll`)
        ]);

        if (!suppliersRes.ok || !itemsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [suppliersData, itemsData] = await Promise.all([
          suppliersRes.json(),
          itemsRes.json()
        ]);

        setSuppliersCount(suppliersData.suppliers.length);
        setItemsCount(itemsData.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCounts();
  }, []);

    const cards = [
        {
          title: "J.V",
          link:'/Pages/Dashboard/Vouchers/Voucher/CreateJV_BRV',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          ),
          size: "col-span-2",
        },
        {
          title: "C.R",
          link:'/Pages/Dashboard/Vouchers/Voucher/CreateCP_CR',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M12 8v4m0 0l3-3m-3 3l-3-3M6 4h12c1.1 0 1.99.9 1.99 2L20 18c0 1.1-.9 2-1.99 2H4c-1.1 0-1.99-.9-1.99-2L4 6c0-1.1.9-2 1.99-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "C.P",
          link:'/Pages/Dashboard/Vouchers/Voucher/CreateCP_CR',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M4 2h16c1.1 0 1.99.9 1.99 2L20 18c0 1.1-.9 2-1.99 2H4c-1.1 0-1.99-.9-1.99-2L4 4c0-1.1.9-2 1.99-2zM4 18V6l8 6 8-6v12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "B.R",
          link:'/Pages/Dashboard/Vouchers/Voucher/CreateBP_BR',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3 12h18M3 6h18M3 18h18M5 3v18M19 3v18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "B.P",
          link:'/Pages/Dashboard/Vouchers/Voucher/CreateBP_BR',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Sales",
          link:'/Pages/Dashboard/Sales/Sale/createSale', 
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M12 2v20m10-10H2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-2",
        },
        {
          title: "Purchase",
          link:'/Pages/Dashboard/Purchase/CreatePurchase', 
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M12 2l2 7h-4l2-7zm0 0l-3 5h6l-3-5zm0 14h6l-1 6h-10l-1-6h6z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Ledger",
          link:'/Pages/Dashboard/Ledger',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Creditor Summary Report",
          link:'/Pages/Dashboard/Main/CreditorSummary',

          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3 12h18M3 6h18M3 18h18M5 3v18M19 3v18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-2",
        },
        {
          title: "Creditor Final Status Report",
          link:'/Pages/Dashboard/Main/CreditorFinalStatus',

          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Debtor Summary Report",
          link:'/Pages/Dashboard/Main/DebitorSummary',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Monthly Turnover and Balance Report",
          link:'/Pages/Dashboard/Main/MonthlyReport',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M12 2v20m10-10H2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-2",
        },
        {
          title: "Payments Report",
          link:'/Pages/Dashboard/Main/PaymentReport',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M12 2v20m10-10H2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Purchase Monthly",
          link:'/Pages/Dashboard/Main/PurchaseMonthly',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-blue-500"
            >
              <path
                d="M12 2l2 7h-4l2-7zm0 0l-3 5h6l-3-5zm0 14h6l-1 6h-10l-1-6h6z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ),
          size: "col-span-1",
        },
        {
          title: "Bank Ledger",
          link:'/Pages/Dashboard/Main/bankLedger',
          icon: (
           <svg version="1.1" id="_x32_"   className="h-6 w-6 text-blue-500" viewBox="0 0 512 512"  fill="rgb(59 130 246)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier" style={{fill:"rgb(59 130 246)"}}>  <g> <path className="st0" d="M162.969,480.609c-0.688-0.703-1.406-1.313-2.094-1.828c-0.719-0.5-1.75-1.125-3.094-1.813 c5.641-3.141,8.469-7.969,8.469-14.5c0-2.875-0.5-5.469-1.5-7.781s-2.406-4.281-4.219-5.906c-1.828-1.625-4.063-2.891-6.688-3.781 c-2.625-0.906-5.531-1.344-8.719-1.344h-27.469V512h28.625c3.188,0,6.094-0.469,8.688-1.391s4.781-2.234,6.625-3.938 c1.813-1.703,3.203-3.734,4.156-6.141c0.969-2.406,1.453-5.109,1.453-8.125c0-2.422-0.328-4.594-1.016-6.516 C165.516,483.969,164.438,482.219,162.969,480.609z M131,455.563h13.063c2.75,0,4.906,0.688,6.484,2.094 c1.563,1.406,2.359,3.344,2.359,5.766c0,2.438-0.797,4.359-2.359,5.766c-1.578,1.406-3.734,2.109-6.484,2.109H131V455.563z M151.453,497.844c-1.609,1.5-3.766,2.25-6.516,2.25H131v-16.797h13.938c2.75,0,4.906,0.734,6.516,2.203s2.391,3.531,2.391,6.156 S153.063,496.344,151.453,497.844z"></path> <path className="st0" d="M207.813,443.656L182.938,512h13.922L201,499.906h24.281L229.313,512h13.906l-24.953-68.344H207.813z M204.734,488.672l8.641-24.859l8.344,24.859H204.734z"></path> <polygon className="st0" points="300.25,485.5 273.188,443.656 261.281,443.656 261.281,512 274.625,512 274.625,470.047 301.688,512 313.594,512 313.594,443.656 300.25,443.656 "></polygon> <polygon className="st0" points="392.703,443.656 376.469,443.656 352.375,473.406 352.375,443.656 339.031,443.656 339.031,512 352.375,512 352.375,491.453 361.219,480.906 378.781,512 394.344,512 370.047,470.813 "></polygon> <polygon className="st0" points="256,0 64,69.344 64,109.344 80,109.344 80,121.344 432,121.344 432,109.344 448,109.344 448,69.344 "></polygon> <polygon className="st0" points="432,357.344 80,357.344 80,389.344 64,389.344 64,421.344 448,421.344 448,389.344 432,389.344 "></polygon> <polygon className="st0" points="344,325.344 344,341.344 408,341.344 408,325.344 400,325.344 400,153.344 408,153.344 408,137.344 344,137.344 344,153.344 352,153.344 352,325.344 "></polygon> <polygon className="st0" points="224,325.344 224,341.344 288,341.344 288,325.344 280,325.344 280,153.344 288,153.344 288,137.344 224,137.344 224,153.344 232,153.344 232,325.344 "></polygon> <polygon className="st0" points="104,325.344 104,341.344 168,341.344 168,325.344 160,325.344 160,153.344 168,153.344 168,137.344 104,137.344 104,153.344 112,153.344 112,325.344 "></polygon> </g> </g></svg>

          ),
          size: "col-span-1",
        },
      ];
    
  return (
    <div className="">
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 w-full ">

        {/* Tile 1 */}
        <div className="flex items-center p-4 bg-white border rounded">
          <div className="flex flex-shrink-0 items-center justify-center bg-green-200 h-16 w-16 rounded">
            <svg
              className="w-6 h-6 fill-current text-green-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-grow flex flex-col ml-4">
            <span className="text-xl font-bold">{suppliersCount}</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total Suppliers</span>
              <span className="text-green-500 text-sm font-semibold ml-2">0%</span>
            </div>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="flex items-center p-4 bg-white border rounded">
          <div className="flex flex-shrink-0 items-center justify-center bg-red-200 h-16 w-16 rounded">
            <svg
              className="w-6 h-6 fill-current text-red-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-grow flex flex-col ml-4">
            <span className="text-xl font-bold">{itemsCount}</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total Items</span>
              <span className="text-red-500 text-sm font-semibold ml-2">0%</span>
            </div>
          </div>
        </div>

        {/* Tile 3 */}
        <div className="flex items-center p-4 bg-white border rounded">
          <div className="flex flex-shrink-0 items-center justify-center bg-green-200 h-16 w-16 rounded">
            <svg
              className="w-6 h-6 fill-current text-green-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-grow flex flex-col ml-4">
            <span className="text-xl font-bold">0</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Approve P.O.</span>
              <span className="text-green-500 text-sm font-semibold ml-2">0%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center p-4 bg-white border rounded">
          <div className="flex flex-shrink-0 items-center justify-center bg-red-200 h-16 w-16 rounded">
            <svg
              className="w-6 h-6 fill-current text-red-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-grow flex flex-col ml-4">
            <span className="text-xl font-bold">0</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Denied PO</span>
              <span className="text-red-500 text-sm font-semibold ml-2">0%</span>
            </div>
          </div>
        </div>

      </div>
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {cards.map((card, index) => (
       
       <Link href={`${card.link}`} key={index} className={`${card.size}`} onClick={(()=>{localStorage.setItem('voucherType', card.title)})}>
       <div className="bg-white p-4 border rounded-lg shadow-md flex items-center justify-between hover:bg-gray-50 transition">
         <div className="flex items-center">
           <div className="p-3 bg-white rounded-full shadow-lg">
             <span className="text-2xl">{card.icon}</span>
           </div>
           <h2 className="font-semibold ml-4">{card.title}</h2>
         </div>
       </div>
     </Link>
        
      ))}
    </div>

    </div>
  );
};

export default Dashboard;
