'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) throw new Error('No user in storage');

        const { token } = JSON.parse(userData);
        if (!token) throw new Error('Token missing');

        // Check with backend if token is still valid
        const response = await axios.post('https://accounts-management.onrender.com/common/user/expiryCheck', {
          token: token,
        });

        if (response.data?.expired) {
          throw new Error('Token expired');
        }

        // Token is valid
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        router.push('/Pages/Login');
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <div className="flex justify-center items-center h-screen w-screen flex-col fixed bg-white z-10">
          <p className='text-lg mb-2'>Authenticating</p>
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
