'use client';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [username, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setRole(parsedUser?.user?.role);
      setUserName(parsedUser?.user?.firstname);
    }

    // Close dropdown if clicked outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile menu toggle (if needed)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  return (
    <div className="flex flex-col flex-1 py-4 px-2 rounded ml-72 fixed w-4/6 z-40">
      <div className="flex items-center justify-between h-16 bg-gray-50 p-2 w-[121%]">
        <div className="flex items-center px-4 space-x-2">
          <button className="text-gray-500 focus:outline-none focus:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="text-sm text-light">Management System - {role}</p>
        </div>

        {/* Dropdown section */}
        <div className="flex items-center pr-4 relative" ref={dropdownRef}>
          <div
           
            className="flex justify-center items-center space-x-2 cursor-pointer"
          >
            <a
              href="#"
              className="flex items-center p-2 text-base font-normal w-8 h-8 text-gray-900 dark:text-white rounded-full bg-slate-500 dark:hover:bg-gray-700"
            >
             
            </a>
            <span className="font-semibold">{username}</span>
            <span  onClick={toggleDropdown}>
<svg className='w-6 h-6' viewBox="0 0 48 48" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 0h48v48H0z" fill="none"></path> <g id="Shopicon"> <path d="M8.706,37.027c2.363-0.585,4.798-1.243,6.545-1.243c0.683,0,1.261,0.101,1.688,0.345c1.474,0.845,2.318,4.268,3.245,7.502 C21.421,43.866,22.694,44,24,44c1.306,0,2.579-0.134,3.816-0.368c0.926-3.234,1.771-6.657,3.244-7.501 c0.427-0.245,1.005-0.345,1.688-0.345c1.747,0,4.183,0.658,6.545,1.243c1.605-1.848,2.865-3.99,3.706-6.333 c-2.344-2.406-4.872-4.891-4.872-6.694c0-1.804,2.528-4.288,4.872-6.694c-0.841-2.343-2.101-4.485-3.706-6.333 c-2.363,0.585-4.798,1.243-6.545,1.243c-0.683,0-1.261-0.101-1.688-0.345c-1.474-0.845-2.318-4.268-3.245-7.502 C26.579,4.134,25.306,4,24,4c-1.306,0-2.579,0.134-3.816,0.368c-0.926,3.234-1.771,6.657-3.245,7.501 c-0.427,0.245-1.005,0.345-1.688,0.345c-1.747,0-4.183-0.658-6.545-1.243C7.101,12.821,5.841,14.962,5,17.306 C7.344,19.712,9.872,22.196,9.872,24c0,1.804-2.527,4.288-4.872,6.694C5.841,33.037,7.101,35.179,8.706,37.027z M18,24 c0-3.314,2.686-6,6-6s6,2.686,6,6s-2.686,6-6,6S18,27.314,18,24z"></path> </g> </g></svg>            </span>
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-8 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
              <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                <li>
                  <Link href="http://localhost:3000/Pages/Dashboard/Systems" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
