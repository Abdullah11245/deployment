'use client';

import React, { useState,useEffect } from 'react';
import './Bar.css'
import Link from 'next/link';
import axios from 'axios';
import end_points from '../../api_url';

const Sidebar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenone, setDropdownOpenone] = useState(false);
  const [dropdownOpentwo, setDropdownOpentwo] = useState(false);
  const [userType, setUserType] = useState(null);
  const [username,setUserName] = useState('');
  const [systemData, setSystemData] = useState(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        // Fetch data from the API
        const response = await axios.get(`${end_points}/system/get`);
          setSystemData(response.data.name); // Set the first item in the state
        
      } catch (error) {
        console.error('Error fetching system data:', error);
      }
    };

    const userData = localStorage.getItem('user');
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
     
      setUserType(parsedUser?.user?.role); 
      setUserName(parsedUser?.user?.firstName)
    }
    fetchSystemData();

  }, []);


  const isAdmin = userType?.toLowerCase() === 'admin';
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleDropdownone = () => {
    setDropdownOpenone(!dropdownOpenone);
  };
  const toggleDropdowntwo = () => {
    setDropdownOpentwo(!dropdownOpentwo);
  };
  return (
   <>
   
   <div className="hidden  h-screen overflow-y-auto fixed md:flex flex-col w-64 custom-scrollbar bg-[#001f3f]">
       {/* {label: "Cash ()", id: "1110001"}, */}
       <div className="flex flex-col flex-1 ">
         <nav className="flex-1 px-2 py-4 ">
           <aside aria-label="Sidebar" >
             <div className="px-1 py-4  rounded ">
               <ul className="space-y-3">
               <li className='flex justify-start items-center space-x-2 p-2'>
                   <Link
                     href="/"
                     className="flex items-center p-2 text-base font-normal w-10 h-10 text-gray-900 rounded-full bg-slate-500 "
                   >
                     
                   </Link>
                     <span className=" font-semibold text-white">{systemData}</span>
             </li>
                 <div className='px-4 space-y-3'>
                 <li >
                   <Link
                     href="/"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg  hover:bg-[#4d87df] "
                   >
                     <svg fill="#c2c7d0" viewBox="0 0 24 24" id="dashboard" data-name="Flat Color" className="icon flat-color w-6 h-6"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier"  ></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M22,4V7a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h5A2,2,0,0,1,22,4ZM9,15H4a2,2,0,0,0-2,2v3a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V17A2,2,0,0,0,9,15Z" style={{fill: "#c2c7d0"}}></path><path id="primary" d="M11,4v7a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H9A2,2,0,0,1,11,4Zm9,7H15a2,2,0,0,0-2,2v7a2,2,0,0,0,2,2h5a2,2,0,0,0,2-2V13A2,2,0,0,0,20,11Z" style={{fill: "#c2c7d0"}}></path></g></svg>
                     <span className="ml-2 text-sm font-semibold text-white">Dashboard</span>
                   </Link>
                 </li>
                 <li >
                   <Link
                     href="/Pages/Dashboard/RoutesList"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-[#4d87df] "
                   >
                    <svg fill="#E5E4E2" version="1.1" id="Layer_1" className='w-6 h-6'  viewBox="0 0 512 512" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M132.741,108.06C59.546,108.06,0,167.606,0,240.801c0,34.903,16.315,85.856,41.556,129.805 c28.759,50.069,61.991,78.787,91.185,78.787c29.194,0,62.426-28.718,91.185-78.787c25.241-43.949,41.555-94.903,41.555-129.805 C265.482,167.606,205.935,108.06,132.741,108.06z M132.741,430.431c-41.194,0-113.778-109.625-113.778-189.63 c0-62.736,51.037-113.778,113.778-113.778c62.741,0,113.778,51.042,113.778,113.778 C246.518,320.805,173.935,430.431,132.741,430.431z"></path> </g> </g> <g> <g> <path d="M132.741,174.431c-36.593,0-66.37,29.773-66.37,66.37c0,36.597,29.778,66.37,66.37,66.37s66.37-29.773,66.37-66.37 C199.111,204.204,169.333,174.431,132.741,174.431z M132.741,288.208c-26.139,0-47.407-21.269-47.407-47.407 c0-26.139,21.269-47.407,47.407-47.407c26.139,0,47.407,21.268,47.407,47.407C180.148,266.94,158.88,288.208,132.741,288.208z"></path> </g> </g> <g> <g> <path d="M417.185,13.245c-52.278,0-94.815,42.532-94.815,94.815c0,47.736,57.62,142.222,94.815,142.222S512,155.796,512,108.06 C512,55.778,469.463,13.245,417.185,13.245z M417.185,231.319c-19.907,0-75.852-77.81-75.852-123.259 c0-41.824,34.028-75.852,75.852-75.852c41.824,0,75.852,34.028,75.852,75.852C493.037,153.509,437.093,231.319,417.185,231.319z"></path> </g> </g> <g> <g> <path d="M417.185,60.653c-26.139,0-47.407,21.268-47.407,47.407c0,26.139,21.269,47.407,47.407,47.407 c26.139,0,47.407-21.269,47.407-47.407C464.593,81.921,443.324,60.653,417.185,60.653z M417.185,136.505 c-15.685,0-28.444-12.759-28.444-28.444c0-15.685,12.759-28.444,28.444-28.444s28.444,12.759,28.444,28.444 C445.63,123.745,432.87,136.505,417.185,136.505z"></path> </g> </g> <g> <g> <path d="M347.407,366.259c-11.426-9.514-16.685-19.546-16.102-30.671c1.296-24.805,32.018-50.611,43.741-58.458 c4.343-2.912,5.518-8.796,2.611-13.148c-2.907-4.357-8.806-5.537-13.139-2.625c-2.046,1.361-50.046,33.801-52.148,73.19 c-0.926,17.278,6.778,32.852,22.889,46.278c35.158,29.301,54.657,58.958,49.667,75.56c-4.259,14.153-26.63,19.509-44.639,21.514 c-81.602,9.079-146.278-17.986-146.935-18.259c-4.824-2.069-10.38,0.181-12.435,4.991c-2.056,4.815,0.167,10.38,4.981,12.44 c2.389,1.028,51.5,21.685,119.88,21.685c11.676,0,23.935-0.602,36.602-2.014c34.472-3.829,54.889-15.57,60.704-34.898 C413.371,427.62,372.611,387.268,347.407,366.259z"></path> </g> </g> </g></svg>
                     <span className="ml-2 text-sm font-semibold text-white">Routes List</span>
                   </Link>
                 </li>
                 <li >
                   <Link
                     href="/Pages/Dashboard/SupplierList"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg  hover:bg-[#4d87df] "
                   >
                    <svg viewBox="0 0 1024 1024" className="icon w-6 h-6" version="1.1"  fill="#c2c7d0"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M579.99872 135.77216h-1.01376v231.20896h391.9872V304.64512c0.04608-1.02912 0.3072-1.9968 0.3072-3.03616V145.8432c0-1.03936-0.26112-2.00704-0.3072-3.03616v-7.04h-0.71168c-4.93056-34.39616-34.22208-60.92288-69.98016-60.92288h-250.30144c-35.75808 0.00512-65.0496 26.53184-69.98016 60.928z" fill="#fff"></path><path d="M970.26048 866.98496h1.01376V362.71104h-391.9872v67.75296c-0.04608 1.11616-0.3072 2.17088-0.3072 3.29728v422.272c0 1.13152 0.26112 2.18112 0.3072 3.29728v7.64928h0.71168c4.93056 37.38624 34.22208 66.21696 69.98016 66.21696h250.30144c35.75808 0.00512 65.0496-28.8256 69.98016-66.21184z" fill="#fff"></path><path d="M579.99872 872.28416h-1.01376v-226.3552h391.9872v62.33088c0.04608 1.02912 0.3072 1.9968 0.3072 3.03616V862.208c0 1.03936-0.26112 2.00704-0.3072 3.03616v7.04h-0.71168c-4.93056 34.39616-34.22208 60.92288-69.98016 60.92288h-250.30144c-35.75808-0.00512-65.0496-26.53184-69.98016-60.92288z" fill="#fff"></path><path d="M313.2928 135.77216h-1.01376v231.20896h391.9872V304.64512c0.04608-1.02912 0.3072-1.9968 0.3072-3.03616V145.8432c0-1.03936-0.26112-2.00704-0.3072-3.03616v-7.04h-0.71168c-4.93056-34.39616-34.22208-60.92288-69.98016-60.92288H383.27296c-35.75808 0.00512-65.0496 26.53184-69.98016 60.928z" fill="#fff"></path><path d="M703.55456 866.98496h1.01376V362.71104h-391.9872v67.75296c-0.04608 1.11616-0.3072 2.17088-0.3072 3.29728v422.272c0 1.13152 0.26112 2.18112 0.3072 3.29728v7.64928h0.71168c4.93056 37.38624 34.22208 66.21696 69.98016 66.21696h250.30144c35.75808 0.00512 65.0496-28.8256 69.98016-66.21184z" fill="#fff"></path><path d="M313.2928 872.28416h-1.01376v-226.3552h391.9872v62.33088c0.04608 1.02912 0.3072 1.9968 0.3072 3.03616V862.208c0 1.03936-0.26112 2.00704-0.3072 3.03616v7.04h-0.71168c-4.93056 34.39616-34.22208 60.92288-69.98016 60.92288H383.27296c-35.75808-0.00512-65.0496-26.53184-69.98016-60.92288z" fill="#fff"></path><path d="M48.01536 135.77216h-1.01888v231.20896h391.9872V304.64512c0.04608-1.02912 0.3072-1.9968 0.3072-3.03616V145.8432c0-1.03936-0.26112-2.00704-0.3072-3.03616v-7.04H438.272c-4.93056-34.39616-34.22208-60.92288-69.98016-60.92288H117.99552c-35.75808 0.00512-65.0496 26.53184-69.98016 60.928z" fill="#fff"></path><path d="M438.27712 866.98496h1.01376V362.71104H47.30368v67.75296c-0.04608 1.11616-0.3072 2.17088-0.3072 3.29728v422.272c0 1.13152 0.26112 2.18112 0.3072 3.29728v7.64928h0.71168c4.93056 37.38624 34.22208 66.21696 69.98016 66.21696h250.30144c35.75808 0.00512 65.0496-28.8256 69.98016-66.21184z" fill="#fff"></path><path d="M48.01536 872.28416h-1.01888v-226.3552h391.9872v62.33088c0.04608 1.02912 0.3072 1.9968 0.3072 3.03616V862.208c0 1.03936-0.26112 2.00704-0.3072 3.03616v7.04H438.272c-4.93056 34.39616-34.22208 60.92288-69.98016 60.92288H117.99552c-35.75808-0.00512-65.0496-26.53184-69.98016-60.92288z" fill="#fff"></path><path d="M246.74816 172.73856m-41.35936 0a41.35936 41.35936 0 1 0 82.71872 0 41.35936 41.35936 0 1 0-82.71872 0Z" fill="#c2c7d0"></path><path d="M507.7504 172.73856m-41.35936 0a41.35936 41.35936 0 1 0 82.71872 0 41.35936 41.35936 0 1 0-82.71872 0Z" fill="#c2c7d0"></path><path d="M764.47232 172.73856m-41.35936 0a41.35936 41.35936 0 1 0 82.71872 0 41.35936 41.35936 0 1 0-82.71872 0Z" fill="#c2c7d0"></path></g></svg>
                     <span className="ml-2 text-sm font-semibold text-white">Suppliers List</span>
                   </Link>
                 </li>
                 <li>
                   <button
                     type="button"
                     className="flex items-center w-full p-2 text-base font-normal text-gray-900 transition duration-75 rounded-lg group hover:bg-[#4d87df] "
                     onClick={toggleDropdown}
                   >
                     <svg fill="#c2c7d0" className='h-8 w-8' viewBox="0 0 100 100" enableBackground="new 0 0 100 100" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <ellipse cx="41.3" cy="42.3" rx="12.2" ry="13.5"></ellipse> <path d="M52.6,57.4c-3.1,2.8-7,4.5-11.3,4.5c-4.3,0-8.3-1.7-11.3-4.6c-5.5,2.5-11,5.7-11,10.7v2.1 c0,2.5,2,4.5,4.5,4.5h35.7c2.5,0,4.5-2,4.5-4.5v-2.1C63.6,63,58.2,59.9,52.6,57.4z"></path> <path d="M68,47.4c-0.2-0.1-0.3-0.2-0.5-0.3c-0.4-0.2-0.9-0.2-1.3,0.1c-2.1,1.3-4.6,2.1-7.2,2.1c-0.3,0-0.7,0-1,0 c-0.5,1.3-1,2.6-1.7,3.7c0.4,0.2,0.9,0.3,1.4,0.6c5.7,2.5,9.7,5.6,12.5,9.8H75c2.2,0,4-1.8,4-4v-1.9C79,52.6,73.3,49.6,68,47.4z"></path> <path d="M66.9,34.2c0-4.9-3.6-8.9-7.9-8.9c-2.2,0-4.1,1-5.6,2.5c3.5,3.6,5.7,8.7,5.7,14.4c0,0.3,0,0.5,0,0.8 C63.4,43,66.9,39.1,66.9,34.2z"></path> </g></svg>
                     <span className="flex-1  text-left whitespace-nowrap ml-2 text-sm font-semibold text-white">
                       Customers List
                     </span>
                     <span className='bg-gray-600 w-6 h-6  rounded-full   flex items-center justify-center'>
                     <svg
                       className={`w-4 h-4  ${dropdownOpen ? 'rotate-180' : ''}`}
                       fill="#c2c7d0"
                       viewBox="0 0 20 20"
                       xmlns="http://www.w3.org/2000/svg"
                     > 
                       <path
                         fillRule="evenodd"
                         d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                         clipRule="evenodd"
                       ></path>
                     </svg>
                     </span>
                     
                   </button>
                   <div
   className={`transition-all duration-500 ease-in-out transform origin-top ${
    dropdownOpen
      ? 'opacity-100 scale-100 max-h-screen'
      : 'opacity-0 scale-95 max-h-0 overflow-hidden'
  }`}
>
  <ul className="py-2 space-y-2 flex flex-col items-left px-4">
    <li className="flex items-center space-x-2">
      <span>
        {/* Add optional icon here */}
      </span>
      <Link
        href="/Pages/Dashboard/Customers/List"
        className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
      >
        Customers List
      </Link>
    </li>
    <li className="flex items-center space-x-2">
      <span>
        {/* Add optional icon here */}
      </span>
      <Link
        href="/Pages/Dashboard/Customers/WiseReport"
        className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
      >
        Wise Report
      </Link>
    </li>
    <li className="flex items-center space-x-2">
      <span>
        {/* Add optional icon here */}
      </span>
      <Link
        href="/Pages/Dashboard/Customers/ReceiptReport"
        className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
      >
        Receipt Report
      </Link>
    </li>
  </ul>
</div>

                 </li>


                 <li>
                   <Link
                     href="/Pages/Dashboard/BankList"
                     className="flex items-center p-2 text-base font-normal text-white rounded-lg  hover:bg-[#4d87df] "
                   >
                     <svg version="1.1" id="_x32_"  className='w-6 h-6' viewBox="0 0 512 512"  fill="#c2c7d0"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier" style={{fill:"#c2c7d0"}}>  <g> <path className="st0" d="M162.969,480.609c-0.688-0.703-1.406-1.313-2.094-1.828c-0.719-0.5-1.75-1.125-3.094-1.813 c5.641-3.141,8.469-7.969,8.469-14.5c0-2.875-0.5-5.469-1.5-7.781s-2.406-4.281-4.219-5.906c-1.828-1.625-4.063-2.891-6.688-3.781 c-2.625-0.906-5.531-1.344-8.719-1.344h-27.469V512h28.625c3.188,0,6.094-0.469,8.688-1.391s4.781-2.234,6.625-3.938 c1.813-1.703,3.203-3.734,4.156-6.141c0.969-2.406,1.453-5.109,1.453-8.125c0-2.422-0.328-4.594-1.016-6.516 C165.516,483.969,164.438,482.219,162.969,480.609z M131,455.563h13.063c2.75,0,4.906,0.688,6.484,2.094 c1.563,1.406,2.359,3.344,2.359,5.766c0,2.438-0.797,4.359-2.359,5.766c-1.578,1.406-3.734,2.109-6.484,2.109H131V455.563z M151.453,497.844c-1.609,1.5-3.766,2.25-6.516,2.25H131v-16.797h13.938c2.75,0,4.906,0.734,6.516,2.203s2.391,3.531,2.391,6.156 S153.063,496.344,151.453,497.844z"></path> <path className="st0" d="M207.813,443.656L182.938,512h13.922L201,499.906h24.281L229.313,512h13.906l-24.953-68.344H207.813z M204.734,488.672l8.641-24.859l8.344,24.859H204.734z"></path> <polygon className="st0" points="300.25,485.5 273.188,443.656 261.281,443.656 261.281,512 274.625,512 274.625,470.047 301.688,512 313.594,512 313.594,443.656 300.25,443.656 "></polygon> <polygon className="st0" points="392.703,443.656 376.469,443.656 352.375,473.406 352.375,443.656 339.031,443.656 339.031,512 352.375,512 352.375,491.453 361.219,480.906 378.781,512 394.344,512 370.047,470.813 "></polygon> <polygon className="st0" points="256,0 64,69.344 64,109.344 80,109.344 80,121.344 432,121.344 432,109.344 448,109.344 448,69.344 "></polygon> <polygon className="st0" points="432,357.344 80,357.344 80,389.344 64,389.344 64,421.344 448,421.344 448,389.344 432,389.344 "></polygon> <polygon className="st0" points="344,325.344 344,341.344 408,341.344 408,325.344 400,325.344 400,153.344 408,153.344 408,137.344 344,137.344 344,153.344 352,153.344 352,325.344 "></polygon> <polygon className="st0" points="224,325.344 224,341.344 288,341.344 288,325.344 280,325.344 280,153.344 288,153.344 288,137.344 224,137.344 224,153.344 232,153.344 232,325.344 "></polygon> <polygon className="st0" points="104,325.344 104,341.344 168,341.344 168,325.344 160,325.344 160,153.344 168,153.344 168,137.344 104,137.344 104,153.344 112,153.344 112,325.344 "></polygon> </g> </g></svg>
                     <span className="ml-2 text-sm font-semibold text-white">Bank List</span>
                    
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/Pages/Dashboard/ItemList"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg  hover:bg-[#4d87df] "
                   >
                     <svg viewBox="0 0 24 24" fill="#c2c7d0" className='w-6 h-6'><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 8H21M7 12H21M7 16H21M3 8H3.01M3 12H3.01M3 16H3.01" stroke="#c2c7d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                     <span className="ml-2 text-sm font-semibold text-white">Items List</span>
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/Pages/Dashboard/Purchase"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg  hover:bg-[#4d87df] "
                   >
                    <svg fill="#c2c7d0" className='w-6 h-6' version="1.1" id="Layer_1"  viewBox="0 0 512.001 512.001" ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M448.875,1.78l-59.314,29.657L330.247,1.78c-4.7-2.35-10.232-2.35-14.932,0L256,31.437L196.686,1.78 c-4.7-2.35-10.232-2.35-14.932,0L122.44,31.437L63.125,1.78C52.05-3.758,38.964,4.304,38.964,16.713v445.202 c0,6.324,3.573,12.104,9.229,14.933l66.78,33.39c4.7,2.35,10.232,2.35,14.932,0l59.314-29.657l59.314,29.657 c4.7,2.35,10.232,2.35,14.932,0l59.314-29.657l59.314,29.657c4.7,2.35,10.232,2.35,14.932,0l66.78-33.39 c5.656-2.828,9.229-8.609,9.229-14.933V16.713C473.036,4.33,459.974-3.768,448.875,1.78z M439.646,395.135v56.462l-50.085,25.043 l-59.314-29.657c-2.35-1.175-4.908-1.762-7.466-1.762s-5.116,0.588-7.466,1.762L256,476.639l-59.314-29.657 c-4.7-2.35-10.232-2.35-14.932,0l-59.314,29.657l-50.085-25.043v-56.462V43.726l42.619,21.31c4.7,2.35,10.232,2.35,14.932,0 l59.314-29.657l59.314,29.657c4.7,2.35,10.232,2.35,14.932,0l59.314-29.657l59.314,29.657c4.7,2.35,10.232,2.35,14.932,0 l42.619-21.31V395.135z"></path> </g> </g> <g> <g> <path d="M211.48,100.189h-89.04c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h89.04 c9.22,0,16.695-7.475,16.695-16.695C228.175,107.664,220.7,100.189,211.48,100.189z"></path> </g> </g> <g> <g> <path d="M211.48,166.969h-89.04c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h89.04 c9.22,0,16.695-7.475,16.695-16.695C228.175,174.444,220.7,166.969,211.48,166.969z"></path> </g> </g> <g> <g> <path d="M211.48,233.749h-89.04c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h89.04 c9.22,0,16.695-7.475,16.695-16.695C228.175,241.224,220.7,233.749,211.48,233.749z"></path> </g> </g> <g> <g> <path d="M211.48,300.53h-89.04c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h89.04 c9.22,0,16.695-7.475,16.695-16.695C228.175,308.004,220.7,300.53,211.48,300.53z"></path> </g> </g> <g> <g> <path d="M122.44,378.44H89.05c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h33.39 c9.22,0,16.695-7.475,16.695-16.695C139.135,385.915,131.66,378.44,122.44,378.44z"></path> </g> </g> <g> <g> <path d="M222.61,378.44h-33.39c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h33.39 c9.22,0,16.695-7.475,16.695-16.695C239.305,385.915,231.83,378.44,222.61,378.44z"></path> </g> </g> <g> <g> <path d="M322.781,378.44h-33.39c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h33.39 c9.22,0,16.695-7.475,16.695-16.695C339.476,385.915,332.001,378.44,322.781,378.44z"></path> </g> </g> <g> <g> <path d="M422.951,378.44h-33.39c-9.22,0-16.695,7.475-16.695,16.695c0,9.22,7.475,16.695,16.695,16.695h33.39 c9.22,0,16.695-7.475,16.695-16.695C439.646,385.915,432.171,378.44,422.951,378.44z"></path> </g> </g> <g> <g> <path d="M352.843,191.165c-17.515-9.258-35.627-18.832-35.627-29.761c0-15.343,12.482-27.825,27.825-27.825 s27.825,12.482,27.825,27.825c0,9.22,7.475,16.695,16.695,16.695c9.22,0,16.695-7.475,16.695-16.695 c0-27.966-18.858-51.594-44.52-58.882v-7.898c0-9.22-7.475-16.695-16.695-16.695c-9.22,0-16.695,7.475-16.695,16.695v7.898 c-25.663,7.287-44.52,30.916-44.52,58.882c0,31.046,29.616,46.701,53.413,59.28c17.515,9.258,35.627,18.832,35.627,29.761 c0,15.343-12.482,27.825-27.825,27.825s-27.825-12.482-27.825-27.825c0-9.22-7.475-16.695-16.695-16.695 c-9.22,0-16.695,7.475-16.695,16.695c0,27.966,18.858,51.594,44.52,58.882v7.898c0,9.22,7.475,16.695,16.695,16.695 c9.22,0,16.695-7.475,16.695-16.695v-7.898c25.663-7.287,44.52-30.916,44.52-58.882 C406.256,219.398,376.64,203.744,352.843,191.165z"></path> </g> </g> </g></svg>
                     <span className="ml-2 text-sm font-semibold text-white">Purchase</span>
                   </Link>
                 </li>
                <li>
  <button
    type="button"
    className="flex items-center w-full p-2 text-base font-normal text-gray-900 transition duration-75 rounded-lg group hover:bg-[#4d87df]"
    onClick={toggleDropdownone}
  >
    <svg viewBox="0 0 24 24" fill="#c2c7d0"  className='w-6 h-6'><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12.75 6C12.75 5.58579 12.4142 5.25 12 5.25C11.5858 5.25 11.25 5.58579 11.25 6V6.31673C9.61957 6.60867 8.25 7.83361 8.25 9.5C8.25 11.4172 10.0628 12.75 12 12.75C13.3765 12.75 14.25 13.6557 14.25 14.5C14.25 15.3443 13.3765 16.25 12 16.25C10.6235 16.25 9.75 15.3443 9.75 14.5C9.75 14.0858 9.41421 13.75 9 13.75C8.58579 13.75 8.25 14.0858 8.25 14.5C8.25 16.1664 9.61957 17.3913 11.25 17.6833V18C11.25 18.4142 11.5858 18.75 12 18.75C12.4142 18.75 12.75 18.4142 12.75 18V17.6833C14.3804 17.3913 15.75 16.1664 15.75 14.5C15.75 12.5828 13.9372 11.25 12 11.25C10.6235 11.25 9.75 10.3443 9.75 9.5C9.75 8.65573 10.6235 7.75 12 7.75C13.3765 7.75 14.25 8.65573 14.25 9.5C14.25 9.91421 14.5858 10.25 15 10.25C15.4142 10.25 15.75 9.91421 15.75 9.5C15.75 7.83361 14.3804 6.60867 12.75 6.31673V6Z" fill="#c2c7d0"></path> </g></svg>
    <span className="flex-1 ml-2 text-sm font-semibold text-white text-left whitespace-nowrap">
      Sales
    </span>
    <span className='bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center'>
      <svg
        className={`w-4 h-4 transform transition-transform duration-300 ${dropdownOpenone ? 'rotate-180' : ''}`}
        fill="#c2c7d0"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        ></path>
      </svg>
    </span>
  </button>

  {/* Dropdown content with animation */}
  <div
    className={`transition-all duration-500 ease-in-out transform origin-top ${
      dropdownOpenone
        ? 'opacity-100 scale-100 max-h-screen'
        : 'opacity-0 scale-95 max-h-0 overflow-hidden'
    }`}
  >
    <ul className="py-2 space-y-2 flex flex-col items-left px-4">
      <li className="flex items-center space-x-2">
        <span>{/* optional icon */}</span>
        <Link
          href="/Pages/Dashboard/Sales/Sale"
          className="flex items-center w-full text-sm font-normal transition duration-75 rounded-lg group hover:bg-[#4d87df] py-2 px-2 text-white"
        >
          Sales
        </Link>
      </li>
      <li className="flex items-center space-x-2">
        <span>{/* optional icon */}</span>
        <Link
          href="/Pages/Dashboard/Sales/SalesReport"
          className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] py-2 px-2"
        >
          Sales Report
        </Link>
      </li>
    </ul>
  </div>
</li>

                <li>
  <button
    type="button"
    className="flex items-center w-full p-2 text-base font-normal text-gray-900 transition duration-75 rounded-lg group hover:bg-[#4d87df]"
    onClick={toggleDropdowntwo}
  >
<svg fill="#c2c7d0" viewBox="0 0 64 64" className='w-6 h-6'><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g  id="_05_discount_tag"> <path d="M54.76,24.53l-3.3-5.19a10.005,10.005,0,0,0,1.68-5.35,1.274,1.274,0,0,0,.02-.28,10.21,10.21,0,0,0-20.41-.46l-6.99,3.09a3.986,3.986,0,0,0-1.7,1.4L8.72,39.81a.978.978,0,0,0-.06,1.04,25.789,25.789,0,0,0,7.13,8.47,24.756,24.756,0,0,0,9.9,4.54,1.492,1.492,0,0,0,.21.02.986.986,0,0,0,.85-.49l3.67-6.12v9.68a1,1,0,0,0,.58.91,28.321,28.321,0,0,0,23.88,0,.989.989,0,0,0,.58-.91V26.93A4.448,4.448,0,0,0,54.76,24.53ZM42.94,5.5a8.237,8.237,0,0,1,8.22,8.24.757.757,0,0,0-.01.15,8.223,8.223,0,0,1-.9,3.55l-1.72-2.71a5.6,5.6,0,0,0-4.73-2.59H41.99a5.469,5.469,0,0,0-1.97.37,4.926,4.926,0,0,0-4.66-.41l-.51.23A8.236,8.236,0,0,1,42.94,5.5ZM30.42,27.3V43.39l-5.01,8.35A22.691,22.691,0,0,1,17,47.73a23.7,23.7,0,0,1-6.29-7.29l15-21.56a2.01,2.01,0,0,1,.85-.71l9.61-4.24a2.875,2.875,0,0,1,1.85-.13,4.99,4.99,0,0,0-.83,1.05L31.06,25A4.528,4.528,0,0,0,30.42,27.3ZM53.46,56.31a26.784,26.784,0,0,1-21.04,0V27.3a2.489,2.489,0,0,1,.36-1.27L38.9,15.88a3.634,3.634,0,0,1,3.09-1.74H43.8a3.581,3.581,0,0,1,3.04,1.67l2.18,3.42a8.118,8.118,0,0,1-6.08,2.7,8.38,8.38,0,0,1-1.57-.17,2.463,2.463,0,0,1,2.15-1.29,1,1,0,0,0,0-2,4.455,4.455,0,1,0,0,8.91,1,1,0,0,0,0-2,2.457,2.457,0,0,1-2.3-1.6,10.144,10.144,0,0,0,8.9-2.81l2.96,4.64a2.446,2.446,0,0,1,.38,1.32Z"></path> <path d="M38.33,32.3a3.3,3.3,0,1,0,3.31,3.3A3.3,3.3,0,0,0,38.33,32.3Zm0,4.6a1.3,1.3,0,1,1,1.31-1.3A1.3,1.3,0,0,1,38.33,36.9Z"></path> <path d="M47.55,43.81a3.305,3.305,0,1,0,3.3,3.31A3.312,3.312,0,0,0,47.55,43.81Zm0,4.61a1.305,1.305,0,1,1,1.3-1.3A1.3,1.3,0,0,1,47.55,48.42Z"></path> <path d="M48.693,33.67a1,1,0,0,0-1.406.149L37.043,46.489A1,1,0,0,0,38.6,47.747l10.244-12.67A1,1,0,0,0,48.693,33.67Z"></path> <path d="M23.479,41.225a1,1,0,1,0-1.268,1.546l2.934,2.407a.99.99,0,0,0,.632.227,1,1,0,0,0,.635-1.773Z"></path> <path d="M17.586,36.415a1,1,0,0,0-1.313,1.508l2.741,2.386A1,1,0,1,0,20.326,38.8Z"></path> </g> </g></svg>    <span className="flex-1 ml-2 text-sm font-semibold text-white text-left whitespace-nowrap">
      Vouchers
    </span>
    <span className='bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center'>
      <svg
        className={`w-4 h-4 transform transition-transform duration-300 ${dropdownOpentwo ? 'rotate-180' : ''}`}
        fill="#c2c7d0"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        ></path>
      </svg>
    </span>
  </button>

  {/* Dropdown with animation */}
  <div
    className={`transition-all duration-500 ease-in-out transform origin-top ${
      dropdownOpentwo
        ? 'opacity-100 scale-100 max-h-screen'
        : 'opacity-0 scale-95 max-h-0 overflow-hidden'
    }`}
  >
    <ul className="py-2 space-y-2 flex flex-col items-left px-4">
      <li className='flex items-center space-x-2'>
        <span>{/* optional icon */}</span>
        <Link
          href="/Pages/Dashboard/Vouchers/Voucher"
          className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
        >
          Vouchers
        </Link>
      </li>
      <li className='flex items-center space-x-2'>
        <span>{/* optional icon */}</span>
        <Link
          href="/Pages/Dashboard/Vouchers/Report"
          className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
        >
          Vouchers Report
        </Link>
      </li>
      <li className='flex items-center space-x-2'>
        <span>{/* optional icon */}</span>
        <Link
          href="/Pages/Dashboard/Vouchers/Dairy"
          className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
        >
          Dairy Vouchers
        </Link>
      </li>
      <li className='flex items-center space-x-2'>
        <span>{/* optional icon */}</span>
        <Link
          href="/Pages/Dashboard/Vouchers/PostDairy"
          className="flex items-center w-full text-sm font-normal text-white transition duration-75 rounded-lg group hover:bg-[#4d87df] p-2"
        >
          Post Dairy Vouchers
        </Link>
      </li>
    </ul>
  </div>
</li>

                 <li>
                   <a
                     href="/Pages/Dashboard/Ledger"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg "
                   >
                     <svg viewBox="0 0 64 64"  role="img" className="iconify iconify--emojione-monotone w-6 h-6" preserveAspectRatio="xMidYMid meet" fill="#c2c7d0"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M61.787 45.709L50.908 7.37c-.635-2.242-2.563-3.783-4.784-4.09a5.645 5.645 0 0 1 2.691 3.2l12.451 37.868c.985 3-.716 6.236-3.801 7.229L31.72 59.69l25.508-9.181c3.048-1.098 4.635-4.391 3.544-7.354L47.001 5.737C46.15 3.428 43.926 2 41.543 2c-.676 0-1.364.114-2.038.357l-26.223 9.438l-4.139 1.491c-2.673.962-3.061 2.415-2.381 4.756c-2.809.826-5.363 2.818-4.638 4.968c.87 2.578 3.921 2.673 7.042 1.667l1.978 5.372c-2.788.835-5.307 2.814-4.586 4.951c.871 2.582 3.89 2.659 7.015 1.649l-.264-.717l1.888 5.128c-2.774.841-5.271 2.813-4.554 4.941c.871 2.582 3.87 2.702 6.995 1.692l-.636-1.727s-3.635 1.162-4.244-.548c-.333-.936 1.381-1.845 3.176-2.358l3.451 9.379c-2.784.836-5.299 2.814-4.578 4.949c.871 2.582 3.898 2.703 7.023 1.693l.037.102c.734 1.988 1.36 2.817 2.612 2.817c.615 0 1.383-.201 2.388-.563l3.896-1.402l26.931-7.258c3.121-.867 4.955-4.031 4.093-7.068M4.239 22.427c-.336-.944 1.414-1.862 3.227-2.372l1.058 2.873c-.051.016-3.679 1.197-4.285-.501m4.434 11.99c-.335-.94 1.402-1.856 3.209-2.367l1.053 2.86c-.007.002-3.653 1.215-4.262-.493m8.25 22.39c-.335-.939 1.396-1.854 3.2-2.365l1.071 2.91c-.006.002-3.664 1.164-4.271-.545m9.265 2.749c-.818.295-1.393.444-1.709.444h-.015c-.093-.106-.33-.452-.719-1.508l-1.633-4.437c.082-.007.169-.019.246-.023c-.011.271.027.549.127.819c.41 1.114 1.654 1.688 2.78 1.282s1.706-1.636 1.298-2.749a2.174 2.174 0 0 0-2.779-1.281c-.081.029-.153.071-.229.108c-.646-.182-1.395-.229-2.182-.161l-3.452-9.38c.091-.009.187-.021.272-.026c-.011.271.027.549.127.82a2.176 2.176 0 0 0 2.781 1.281a2.14 2.14 0 0 0 1.297-2.75a2.175 2.175 0 0 0-2.779-1.281c-.081.029-.152.072-.229.109c-.652-.184-1.411-.229-2.208-.158l-3.313-9c.079-.007.163-.019.238-.023c-.009.266.028.538.126.804a2.177 2.177 0 0 0 2.781 1.282a2.14 2.14 0 0 0 1.297-2.75a2.174 2.174 0 0 0-2.779-1.281c-.089.032-.168.077-.249.119c-.64-.176-1.377-.222-2.151-.155l-3.677-9.988c.073-.006.151-.017.222-.021c-.004.251.031.506.123.756a2.177 2.177 0 0 0 2.781 1.282a2.139 2.139 0 0 0 1.297-2.75a2.174 2.174 0 0 0-2.779-1.281c-.111.04-.212.094-.313.149c-.612-.159-1.313-.202-2.047-.143c-.342-1.109-.293-1.548-.217-1.711c.043-.091.261-.415 1.297-.788l4.139-1.491L40.18 4.237A4.07 4.07 0 0 1 41.543 4c1.606 0 3.046.976 3.581 2.428l13.771 37.418c.333.904.288 1.89-.124 2.775a3.87 3.87 0 0 1-2.221 2.007l-26.222 9.438l-4.14 1.49" fill="#c2c7d0"></path><path d="M38.087 15.948l-17.185 6.186l2.652 7.205l17.185-6.187l-2.652-7.204m-15.898 6.785l15.302-5.508l1.961 5.327l-15.302 5.509l-1.961-5.328" fill="#c2c7d0"></path></g></svg>
                     <span className="flex-1 ml-2 text-sm font-semibold text-white whitespace-nowrap">Ledger</span>
                   </a>
                 </li>
                
                 {isAdmin && (
                   <>
                 <li>
                   <Link
                     href="/Pages/Dashboard/UsersList"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg "
                   >
                     <svg viewBox="0 0 24 24" className='w-6 h-6' fill="none"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.5 7.5C15.5 9.433 13.933 11 12 11C10.067 11 8.5 9.433 8.5 7.5C8.5 5.567 10.067 4 12 4C13.933 4 15.5 5.567 15.5 7.5Z" fill="#c2c7d0"></path> <path opacity="0.4" d="M19.5 7.5C19.5 8.88071 18.3807 10 17 10C15.6193 10 14.5 8.88071 14.5 7.5C14.5 6.11929 15.6193 5 17 5C18.3807 5 19.5 6.11929 19.5 7.5Z" fill="#c2c7d0"></path> <path opacity="0.4" d="M4.5 7.5C4.5 8.88071 5.61929 10 7 10C8.38071 10 9.5 8.88071 9.5 7.5C9.5 6.11929 8.38071 5 7 5C5.61929 5 4.5 6.11929 4.5 7.5Z" fill="#c2c7d0"></path> <path d="M18 16.5C18 18.433 15.3137 20 12 20C8.68629 20 6 18.433 6 16.5C6 14.567 8.68629 13 12 13C15.3137 13 18 14.567 18 16.5Z" fill="#c2c7d0"></path> <path opacity="0.4" d="M22 16.5C22 17.8807 20.2091 19 18 19C15.7909 19 14 17.8807 14 16.5C14 15.1193 15.7909 14 18 14C20.2091 14 22 15.1193 22 16.5Z" fill="#c2c7d0"></path> <path opacity="0.4" d="M2 16.5C2 17.8807 3.79086 19 6 19C8.20914 19 10 17.8807 10 16.5C10 15.1193 8.20914 14 6 14C3.79086 14 2 15.1193 2 16.5Z" fill="#c2c7d0"></path> </g></svg>
                     <span className="flex-1 ml-2 text-sm font-semibold text-white whitespace-nowrap">Users List</span>
                   </Link>
                 </li>
                 <li>
                   <Link
                     href="/Pages/Dashboard/Systems"
                     className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg "
                   >
                    <svg fill="#c2c7d0" viewBox="0 0 1920 1920" className='w-6 h-6'><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1703.534 960c0-41.788-3.84-84.48-11.633-127.172l210.184-182.174-199.454-340.856-265.186 88.433c-66.974-55.567-143.323-99.389-223.85-128.415L1158.932 0h-397.78L706.49 269.704c-81.43 29.138-156.423 72.282-223.962 128.414l-265.073-88.32L18 650.654l210.184 182.174C220.39 875.52 216.55 918.212 216.55 960s3.84 84.48 11.633 127.172L18 1269.346l199.454 340.856 265.186-88.433c66.974 55.567 143.322 99.389 223.85 128.415L761.152 1920h397.779l54.663-269.704c81.318-29.138 156.424-72.282 223.963-128.414l265.073 88.433 199.454-340.856-210.184-182.174c7.793-42.805 11.633-85.497 11.633-127.285m-743.492 395.294c-217.976 0-395.294-177.318-395.294-395.294 0-217.976 177.318-395.294 395.294-395.294 217.977 0 395.294 177.318 395.294 395.294 0 217.976-177.317 395.294-395.294 395.294" fillRule="evenodd"></path> </g></svg>
                     <span className="flex-1 ml-2 text-sm font-semibold text-white whitespace-nowrap">Settings</span>
                   </Link>
                 </li>
                 </>
                  )}
               
               
                 </div>
               
               </ul>
             </div>
           </aside>
         </nav>
       </div>
     </div>
   </>
      

     
     

  );
};

export default Sidebar;
