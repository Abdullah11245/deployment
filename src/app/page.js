'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './Pages/Dashboard/Home/page';
import ProtectedRoute from './RouteProtection'; // Adjust path as needed

export default function Home() {
  const [isTokenValid, setIsTokenValid] = useState(true); // State to store token validity
  const [loading, setLoading] = useState(true); // Loading state while checking the token

  useEffect(() => {
    const checkTokenExpiry = async () => {
      try {
        // Retrieve the user data from localStorage
        const userData = localStorage.getItem('user'); // Assuming 'user' is the key where the token is stored
        if (!userData) {
          console.error('No user data found in localStorage');
          setIsTokenValid(false); // If no user data, the token is not valid
          return;
        }

        // Parse the user data
        const parsedUserData = JSON.parse(userData);
        // Retrieve the token from parsed user data
        const token = parsedUserData?.token;
        console.log(token)
        if (!token) {
          console.error('No token found in user data');
          setIsTokenValid(false); // If no token, the token is not valid
          return;
        }

        // Make a POST request to check the token expiry
        const response = await axios.post('https://accounts-management.onrender.com/common/user/expiryCheck', {
          token: token, // Send the token in the request body
        });
        // Handle the response accordingly
        if (response.data) {
          console.log('Token has expired');
          setIsTokenValid(false); // Token expired, mark as invalid
        } else {
          console.log('Token is valid');
          setIsTokenValid(true); // Token is valid
        }
      } catch (error) {
        console.error('Error while checking token expiry:', error);
        setIsTokenValid(false); // In case of an error, assume the token is invalid
      } finally {
        setLoading(false); // Done with the request
      }
    };

    checkTokenExpiry();
  }, []); // Empty dependency array, runs once on component mount

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
