'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null); // For modal
  const [showModal, setShowModal] = useState(false);

  const usersPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/user/getAll');
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateNew = () => {
    router.push('/Pages/Dashboard/UsersList/createUser');
  };

  const handleEdit = (user) => {
    router.push(`/Pages/Dashboard/UsersList/${user.id}`);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    setLoading(true); // Start loading when the delete operation begins
  
    try {
      const response = await axios.delete(`https://accounts-management.onrender.com/common/user/${selectedUser.id}`);
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== selectedUser.id));
        toast.success(`${selectedUser.firstname} deleted successfully.`);
      } else {
        toast.error(`Failed to delete ${selectedUser.firstname}.`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong while deleting the user.');
    } finally {
      setShowModal(false);  // Close the modal after the operation completes
      setSelectedUser(null); // Clear the selected user
      setLoading(false); // Stop loading after the delete operation is finished
    }
  };
  

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    <div className="container mx-auto px-4 py-8 relative">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">List of Users</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center"
          onClick={handleCreateNew}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            />
          </svg>
          Create New
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        {currentUsers.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No users found.</p>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-500">
              <tr className='text-white '>
                <th className="px-6 py-3 text-left text-sm font-medium  uppercase">Avatar</th>
                <th className="px-6 py-3 text-left text-sm font-medium  uppercase">First Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium  uppercase">Last Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium  uppercase">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium  uppercase">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium  uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                   <svg height="40px" width="40px" version="1.1" id="Layer_1" viewBox="0 0 333.815 333.815"  fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_1400_"> <g id="XMLID_1401_"> <g id="XMLID_1402_"> <path id="XMLID_1403_" style={{fill:"#F3D8B6"}} d="M250.097,238.262c-18.667-6.681-51.458-11.736-51.458-81.376h-29.23h-5.002 h-29.23c0,69.64-32.791,74.695-51.458,81.376c0,47.368,68.832,48.824,80.688,53.239v1.537c0,0,0.922-0.188,2.501-0.68 c1.579,0.492,2.501,0.68,2.501,0.68v-1.537C181.265,287.086,250.097,285.63,250.097,238.262z"></path> </g> <path id="XMLID_1404_" style={{fill:"#EEC8A2"}} d="M198.639,156.886h-29.23h-2.834v135.573c0.11-0.033,0.216-0.064,0.333-0.101 c1.579,0.492,2.501,0.68,2.501,0.68V291.5c11.856-4.414,80.688-5.871,80.688-53.238 C231.43,231.581,198.639,226.526,198.639,156.886z"></path> </g> <g id="XMLID_1405_"> <ellipse id="XMLID_65_" transform="matrix(0.3543 -0.9351 0.9351 0.3543 41.877 286.6909)" style={{fill:"#EDCEAE"}} cx="228.54" cy="113.021" rx="17.187" ry="10.048"></ellipse> <ellipse id="XMLID_64_" transform="matrix(0.3543 0.9351 -0.9351 0.3543 172.9698 -24.4475)" style={{fill:"#F3DBC4"}} cx="104.188" cy="113.029" rx="17.187" ry="10.048"></ellipse> </g> <g id="XMLID_1406_"> <g id="XMLID_1407_"> <path id="XMLID_1408_" style={{fill:"#F3DBC4"}} d="M166.91,180.733c-27.454,0-48.409-23.119-57.799-40.456 s-15.888-79.445,4.34-106.897c19.808-26.883,53.459-13.838,53.459-13.838s33.649-13.045,53.458,13.838 c20.226,27.452,13.726,89.56,4.335,106.897C215.311,157.614,194.359,180.733,166.91,180.733z"></path> </g> <path id="XMLID_1409_" style={{fill:"#EDCEAE"}} d="M220.368,33.381c-19.81-26.884-53.458-13.838-53.458-13.838 s-0.118-0.045-0.335-0.123v161.305c0.112,0.001,0.222,0.009,0.335,0.009c27.449,0,48.401-23.119,57.794-40.456 C234.094,122.941,240.595,60.833,220.368,33.381z"></path> </g> <g id="XMLID_1410_"> <g id="XMLID_1411_"> <path id="XMLID_1414_" style={{fill:"#545465"}} d="M286.89,293.134v40.681H46.926v-40.681c0-30.431,17.377-56.963,40.605-70.913 c6.043-3.641,19.69-7.43,26.844-9.196c5.953-1.488,53.438,22.729,53.438,22.729s48.674-23.218,54.627-21.729 c7.154,1.766,17.802,4.554,23.844,8.196C269.513,236.171,286.89,262.702,286.89,293.134z"></path> </g> <path id="XMLID_1417_" style={{fill:"#494857"}} d="M246.285,222.22c-6.043-3.641-16.69-6.429-23.844-8.196 c-5.953-1.488-54.627,21.729-54.627,21.729s-0.442-0.225-1.239-0.627v98.688H286.89v-40.681 C286.89,262.703,269.513,236.171,246.285,222.22z"></path> </g> <g id="XMLID_1418_"> <polygon id="XMLID_1419_" style={{fill:"#D7734A"}} points="188.575,240.372 166.908,233.538 145.241,240.372 159.555,251.364 150.575,333.814 183.241,333.814 174.261,251.364 "></polygon> <polygon id="XMLID_1420_" style={{fill:"#D35D3B"}} points="188.575,240.372 166.908,233.538 166.575,233.643 166.575,333.814 183.241,333.814 174.261,251.364 "></polygon> </g> <g id="XMLID_1421_"> <path id="XMLID_1422_" style={{fill:"#FFFFFF"}} d="M215.075,209.247l-48.167,23.441l-48.167-23.441 c-11.5,5.5,10.396,38.436,14.833,36.833c10.963-3.96,33.334-10.329,33.334-10.329s22.371,6.369,33.334,10.329 C204.679,247.683,226.575,214.747,215.075,209.247z"></path> <path id="XMLID_1423_" style={{fill:"#DEDDE0"}} d="M215.075,209.247l-48.167,23.441l-0.333-0.162v3.321 c0.211-0.061,0.333-0.095,0.333-0.095s22.371,6.369,33.334,10.329C204.679,247.683,226.575,214.747,215.075,209.247z"></path> </g> <g id="XMLID_1424_"> <path id="XMLID_1427_" style={{fill:"#E1A98C"}} d="M183.075,160.793l-16.452-3.907l-15.881,3.907l2.282,20.541 c4.299,1.752,8.946,2.791,13.886,2.791c4.938,0,9.585-1.039,13.883-2.791L183.075,160.793z"></path> <path id="XMLID_1428_" style={{fill:"#D2987B"}} d="M166.623,156.886l-0.048,0.012v27.219c0.112,0.001,0.222,0.009,0.334,0.009 c4.938,0,9.585-1.039,13.883-2.791l2.282-20.542L166.623,156.886z"></path> </g> <g id="XMLID_1429_"> <g id="XMLID_1430_"> <path id="XMLID_1433_" style={{fill:"#E1A98C"}} d="M223.571,25.321c-2.159,0.08-12.282-31.303-39.282-24.303 c-18.537,4.806-20.877,7.419-28.12,9.463c-29.41-9.014-57.539,14.472-56.495,36.488c1.759,37.07-4.778,36.505-0.295,49.454 s8.466,23.407,8.466,23.407s0.996,3.565,2.988-16.854s-4.705-31.379,11.137-31.379c52.452,0-19.698,20.372,13.952,20.372 c33.391,0,59.203-27.381,74.92-29.372c15.716-1.992,9.145,19.96,11.137,40.379s2.988,16.854,2.988,16.854 s8.92-9.712,8.466-23.407C232.923,80.969,239.803,24.719,223.571,25.321z"></path> </g> <path id="XMLID_1434_" style={{fill:"#D2987B"}} d="M223.571,25.322c-2.159,0.08-12.282-31.303-39.282-24.303 c-8.808,2.284-13.956,4.071-17.714,5.539V84.84c18.759-8.259,33.769-20.913,44.268-22.243c15.716-1.992,9.145,19.96,11.137,40.379 c1.992,20.419,2.988,16.854,2.988,16.854s8.92-9.712,8.466-23.407C232.923,80.969,239.803,24.719,223.571,25.322z"></path> </g> <g id="XMLID_1435_"> <ellipse id="XMLID_33_" transform="matrix(0.3543 -0.9351 0.9351 0.3543 41.877 286.6909)" style={{fill:"#EDCEAE"}} cx="228.54" cy="113.021" rx="17.187" ry="10.048"></ellipse> <ellipse id="XMLID_32_" transform="matrix(0.3543 0.9351 -0.9351 0.3543 172.9698 -24.4475)" style={{fill:'#F3DBC4'}} cx="104.188" cy="113.029" rx="17.187" ry="10.048"></ellipse> </g> </g> </g></svg>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{user.firstname}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{user.lastname}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{user.role === '1' ? 'Admin' : 'User'}</td>
                  <td className="px-6 py-4">
<div className="flex gap-2">
  <button
    onClick={() => handleEdit(user)}
    className="bg-gray-200 text-white p-2 rounded-full hover:bg-green-200 w-[35px] h-[35px] flex items-center justify-center"
  >
  <svg viewBox="0 0 24 24" fill="none" width='25px' height='25px' ><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.1498 7.93997L8.27978 19.81C7.21978 20.88 4.04977 21.3699 3.32977 20.6599C2.60977 19.9499 3.11978 16.78 4.17978 15.71L16.0498 3.84C16.5979 3.31801 17.3283 3.03097 18.0851 3.04019C18.842 3.04942 19.5652 3.35418 20.1004 3.88938C20.6356 4.42457 20.9403 5.14781 20.9496 5.90463C20.9588 6.66146 20.6718 7.39189 20.1498 7.93997V7.93997Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>

  </button>

  <button
    onClick={() => handleDeleteClick(user)}
    className="bg-gray-200 text-white p-2 rounded-full hover:bg-red-200 w-[35px] h-[35px] flex items-center justify-center"
  >
   <svg viewBox="0 -0.5 25 25" fill="none" width='25px' height='25px'><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z" fill="#000000"></path> </g></svg>        

  </button>
</div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {users.length > usersPerPage && (
        <div className="flex justify-between items-center mt-8">
          <span className="text-sm font-semibold text-gray-700">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of {users.length} entries
          </span>

          <ol className="flex gap-1 text-xs font-medium">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page}>
                <button
                  className={`block w-8 h-8 rounded border ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'border-gray-300'
                  } text-center leading-8`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-red-600">
                {selectedUser?.firstname} 
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTable;
