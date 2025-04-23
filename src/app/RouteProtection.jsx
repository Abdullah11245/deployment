'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const user = localStorage.getItem('user');

      if (!user) {
        router.push('/Pages/Login');
      } else {
        setIsChecking(false); // User is found, stop checking
      }
    }, 2000); // 2 seconds timeout

    return () => clearTimeout(timeout); // Cleanup timeout on component unmount
  }, [router]);

  if (isChecking) {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center h-screen w-screen flex-col bg-white z-50">
        <p className="text-lg mb-2">Authenticating</p>
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
