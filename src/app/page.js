'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Pages/Dashboard/Home/page';
import ProtectedRoute from './RouteProtection'; 
import { useRouter } from 'next/navigation';
export default function Home() {
  const [isTokenValid, setIsTokenValid] = useState(true); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const checkTokenExpiry = async () => {
      try {
        const userData = localStorage.getItem('user'); 
        if (!userData) {
          console.error('No user data found in localStorage');
          setIsTokenValid(false); 
          return;
        }

        const parsedUserData = JSON.parse(userData);
        const token = parsedUserData?.token;
        console.log(token)
        if (!token) {
          console.error('No token found in user data');
          setIsTokenValid(false); 
          return;
        }

        const response = await axios.post('https://accounts-management.onrender.com/common/user/expiryCheck', {
          token: token, 
        });
        if (response.data) {
        
          setIsTokenValid(false); 
        } else {
          console.log('Token is valid');
          setIsTokenValid(true);
        }
      } catch (error) {
        console.error('Error while checking token expiry:', error);
        localStorage.removeItem('user');
        router.push('/login'); 
        setIsTokenValid(false); 
      } finally {
        setLoading(false);
      }
    };

    checkTokenExpiry();
  }, []); 

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
    <ProtectedRoute isTokenValid={isTokenValid}>
      <div className="p-4">
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
}
