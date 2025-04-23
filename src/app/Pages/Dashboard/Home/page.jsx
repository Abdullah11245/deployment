'use client'
import React from 'react';
import Link from 'next/link';

const Dashboard = () => {
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
            <span className="text-xl font-bold">430</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total Suppliers</span>
              <span className="text-green-500 text-sm font-semibold ml-2">+12.6%</span>
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
            <span className="text-xl font-bold">211</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total Items</span>
              <span className="text-red-500 text-sm font-semibold ml-2">-8.1%</span>
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
            <span className="text-xl font-bold">140</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Approve P.O.</span>
              <span className="text-green-500 text-sm font-semibold ml-2">+28.4%</span>
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
            <span className="text-xl font-bold">211</span>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Denied PO</span>
              <span className="text-red-500 text-sm font-semibold ml-2">-8.1%</span>
            </div>
          </div>
        </div>

      </div>
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {cards.map((card, index) => (
       
       <Link href={`${card.link}`} key={index} className={`${card.size}`}>
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
