'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Components/Navbar/Navbar';
import Sidebar from './Components/Side&Topbar/Bars';
import ProtectedRoute from './RouteProtection'; // adjust path

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  const noLayoutRoutes = ['/Pages/Login']; // etc.
  const isMinimalLayout = noLayoutRoutes.includes(pathname);

  if (isMinimalLayout) {
    return (
    <>
    
    {children}
    </>
    
    );
  }

  return (
    <ProtectedRoute> {/* 🔒 Moved here */}
        <Navbar />
        <div className="flex">
          <div className="mr-64">
            <Sidebar />
          </div>
          <div className="w-full p-4 mt-16">
            {children}
          </div>
        </div>
    </ProtectedRoute>
  );
}
