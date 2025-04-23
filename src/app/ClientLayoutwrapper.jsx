'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Components/Navbar/Navbar';
import Sidebar from './Components/Side&Topbar/Bars';
import ProtectedRoute from './RouteProtection'; // adjust path

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  // List of routes that don't need the full layout
  const noLayoutRoutes = ['/Pages/Login']; 
  const isMinimalLayout = noLayoutRoutes.includes(pathname);

  // If it's a route with no layout (like Login), we skip the layout
  if (isMinimalLayout) {
    return <>{children}</>; 
  }

  return (
    <ProtectedRoute> {/* 🔒 This will protect the layout */}
      <Navbar />
      <div className="flex">
        <div className="mr-64">
          <Sidebar />
        </div>
        <div className="w-full p-4 mt-16">
          {children} {/* Main content */}
        </div>
      </div>
    </ProtectedRoute>
  );
}
