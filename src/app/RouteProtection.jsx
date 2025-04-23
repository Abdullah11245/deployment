'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = localStorage.getItem('user');

      if (!user) {
        router.push('/Pages/Login');
      } else {
        setIsChecking(false); // User is found, stop checking
      }
    }, 3000); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // Cleanup the timeout on unmount
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex justify-center items-center h-screen w-screen flex-col relative bg-white z-10">
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
