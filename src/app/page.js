import Dashboard from './Pages/Dashboard/Home/page';
import ProtectedRoute from './RouteProtection'; // Adjust path as needed

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <Dashboard />
      </div>
   </ProtectedRoute>
  );
}
