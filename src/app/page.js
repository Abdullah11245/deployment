'use client';
import ProtectedRoute from './RouteProtection';
import Dashboard from './Pages/Dashboard/Home/page';

export default function Home() {
  return (
    // <ProtectedRoute>
      <div className="p-4">
        <Dashboard />
      </div>
    // </ProtectedRoute>
  );
}
