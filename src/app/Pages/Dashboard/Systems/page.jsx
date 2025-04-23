'use client';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // Import toast

function UserTable() {
  const [formData, setFormData] = useState({
    systemName: '',
    systemShortName: '',
    companyName: '',
    companyEmail: '',
    companyAddress: '',
  });

  const [logoUrl, setLogoUrl] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [systemId, setSystemId] = useState(null); // For update
  const [loading, setLoading] = useState(true); // Loading state


  useEffect(() => {
    // Fetch existing system data
    const fetchSystem = async () => {
      setLoading(true); // Start loading while fetching data
      try {
        const res = await fetch('https://accounts-management.onrender.com/common/system/get');
        const data = await res.json();

        if (data !== undefined && data !== null && data !== '') {
          const system = data;
          setFormData({
            systemName: system.system_name,
            systemShortName: system.short_name,
            companyName: system.company_name,
            companyEmail: system.email,
            companyAddress: system.address,
          });
          setLogoUrl(system.logo);
          setCoverUrl(system.cover);
          setSystemId(system.id);
        }
      } catch (err) {
        console.error('Error fetching system:', err);
        toast.error('Failed to fetch system data'); // Show error toast on fetch failure
      } finally {
        setLoading(false); // Stop loading after fetching data
      }
    };

    fetchSystem();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file, type) => {
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    try {
      setLoading(true); // Start loading while uploading image
      const res = await fetch('https://accounts-management.onrender.com/common/auth/upload', {
        method: 'POST',
        body: imageFormData,
      });

      const data = await res.json();
      const url = data?.data;
      if (type === 'logo') setLogoUrl(url);
      else if (type === 'cover') setCoverUrl(url);
      toast.success(`${type} uploaded successfully!`); // Show success toast on image upload
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Error uploading ${type}`); // Show error toast on upload failure
    } finally {
      setLoading(false); // Stop loading after uploading image
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'systemLogo') {
        uploadImage(files[0], 'logo');
      } else if (name === 'coverPhoto') {
        uploadImage(files[0], 'cover');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading while submitting

    const payload = {
      name: formData.systemName,
      short_name: formData.systemShortName,
      system_name: formData.systemName,
      company_name: formData.companyName,
      address: formData.companyAddress,
      email: formData.companyEmail,
      logo: logoUrl,
      cover: coverUrl,
    };

    try {
      const res = await fetch(
        systemId
          ? `https://accounts-management.onrender.com/common/system/${systemId}`
          : 'https://accounts-management.onrender.com/common/system/create',
        {
          method: systemId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      console.log('System response:', result);
      toast.success(`System ${systemId ? 'Updated' : 'Created'} Successfully!`); // Show success toast
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission failed. Check console for details.'); // Show error toast on submission failure
    } finally {
      setLoading(false); // Stop loading after submission
    }
  };

  // Loading animation
  const LoadingAnimation = () => (
    <div className="flex justify-center items-center h-screen bg-white">
    <div className="flex space-x-2">
      <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
      <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
    </div>
    </div>
  );
  if ( loading ) return <LoadingAnimation/>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" reverseOrder={false} /> {/* Toast container */}

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">System Information</h2>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-2">
        <form className="px-4 md:px-8 max-w-5xl mx-auto py-12" onSubmit={handleSubmit}>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* Form fields for system details */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold leading-6 text-gray-700 px-2">System Name</label>
                  <input
                    type="text"
                    name="systemName"
                    placeholder="System Name"
                    value={formData.systemName}
                    onChange={handleFormChange}
                    className="mt-2 block w-full rounded border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold leading-6 text-gray-700 px-2">Short System Name</label>
                  <input
                    type="text"
                    name="systemShortName"
                    placeholder="Short System Name"
                    value={formData.systemShortName}
                    onChange={handleFormChange}
                    className="mt-2 block w-full rounded border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-semibold leading-6 text-gray-700 px-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleFormChange}
                    className="mt-2 block w-full rounded border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-semibold leading-6 text-gray-700 px-2">Company Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    placeholder="Company Email"
                    value={formData.companyEmail}
                    onChange={handleFormChange}
                    className="mt-2 block w-full rounded border-0 py-2 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label className="block text-sm font-semibold leading-6 text-gray-700 px-2">System Logo</label>
                  <div className="mt-2 flex items-center gap-x-4">
                    <input
                      type="file"
                      name="systemLogo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-sm"
                    />
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-8 h-8 rounded object-cover border border-gray-300"
                      />
                    )}
                  </div>
                  {logoUrl && <p className="text-sm text-green-600 mt-1">Logo uploaded ✓</p>}
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-semibold leading-6 text-gray-700 px-2">Cover photo</label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      <img
                        className="w-48 h-32 object-cover rounded"
                        src={
                          coverUrl ||
                          'https://images.unsplash.com/photo-1739560116851-6cdbf96bd609?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0OHx8fGVufDB8fHx8fA%3D%3D'
                        }
                        alt="Cover"
                      />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            name="coverPhoto"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                      {coverUrl && <p className="text-sm text-green-600 mt-2">Cover uploaded ✓</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <LoadingAnimation /> : systemId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserTable;
