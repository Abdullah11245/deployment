'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

function RouteList() {
  const [mergedData, setMergedData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includedSuppliers, setIncludedSuppliers] = useState([]);
  const [excludedSuppliers, setExcludedSuppliers] = useState([]);
  const [includedRoutes, setIncludedRoutes] = useState([]);
  const [excludedRoutes, setExcludedRoutes] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [supplierMap, setSupplierMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsRes, purchasesRes, suppliersRes, routesRes] = await Promise.all([
          axios.get('https://accounts-management.onrender.com/common/purchaseDetail/getAll'),
          axios.get('https://accounts-management.onrender.com/common/purchase/getAll'),
          axios.get('https://accounts-management.onrender.com/common/suppliers/getAll'),
          axios.get('https://accounts-management.onrender.com/common/routes/getAll'),
        ]);

        const details = detailsRes.data || [];
        const purchases = purchasesRes.data || [];
        const suppliers = suppliersRes.data.suppliers || [];
        const routes = routesRes.data.routes || [];

        // Create supplier ID to name map
        const supplierMapTemp = {};
        suppliers.forEach(s => {
          supplierMapTemp[s.id] = s.name;
        });
        setSupplierMap(supplierMapTemp);

        // Merge purchase with details
        const merged = purchases.map((purchase) => {
          const detailsForPurchase = details.filter(detail => detail.purchase_id === purchase.id);
          return { ...purchase, details: detailsForPurchase };
        });

        setMergedData(merged);
        setOriginalData(merged);
        setSupplierOptions(suppliers.map((s) => ({ label: s.name, value: s.id })));
        setRouteOptions(routes.map((r) => ({ label: r.name, value: r.id })));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const includedSupplierIds = includedSuppliers.map(s => s.value);
    const excludedSupplierIds = excludedSuppliers.map(s => s.value);
    const includedRouteIds = includedRoutes.map(r => r.value);
    const excludedRouteIds = excludedRoutes.map(r => r.value);

    const filtered = originalData.filter(entry => {
      const detailsForPurchase = entry.details;

      const purchaseDate = new Date(entry.purchase_date);
      const dateOnly = new Date(purchaseDate.toISOString().split('T')[0]);

      const isAfterStart = startDate ? dateOnly >= new Date(startDate) : true;
      const isBeforeEnd = endDate ? dateOnly <= new Date(endDate) : true;
      const isWithinDateRange = isAfterStart && isBeforeEnd;

      const supplierIncluded =
        includedSupplierIds.length === 0 || detailsForPurchase.some(d => includedSupplierIds.includes(d.supplier_id));
      const supplierExcluded =
        excludedSupplierIds.length === 0 || !detailsForPurchase.some(d => excludedSupplierIds.includes(d.supplier_id));

      const routeIds = detailsForPurchase.map(d => Number(d.route_id));
      const routeIncluded =
        includedRouteIds.length === 0 || routeIds.some(routeId => includedRouteIds.includes(routeId));
      const routeExcluded =
        excludedRouteIds.length === 0 || !routeIds.some(routeId => excludedRouteIds.includes(routeId));

      return isWithinDateRange && supplierIncluded && supplierExcluded && routeIncluded && routeExcluded;
    });

    setMergedData(filtered);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setIncludedSuppliers([]);
    setExcludedSuppliers([]);
    setIncludedRoutes([]);
    setExcludedRoutes([]);
    setMergedData(originalData);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex space-x-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Creditor Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-2 px-4 py-2 border rounded-md text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Included Suppliers</label>
          <Select
            options={supplierOptions}
            value={includedSuppliers}
            onChange={setIncludedSuppliers}
            isMulti
            placeholder="Select Suppliers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Excluded Suppliers</label>
          <Select
            options={supplierOptions}
            value={excludedSuppliers}
            onChange={setExcludedSuppliers}
            isMulti
            placeholder="Select Excluded Suppliers"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Included Routes</label>
          <Select
            options={routeOptions}
            value={includedRoutes}
            onChange={setIncludedRoutes}
            isMulti
            placeholder="Select Routes"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Excluded Routes</label>
          <Select
            options={routeOptions}
            value={excludedRoutes}
            onChange={setExcludedRoutes}
            isMulti
            placeholder="Select Excluded Routes"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="ml-3 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-6">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.map((entry, index) => {
              const validDetails = entry.details.filter(
                (d) => !isNaN(Number(d.qty)) && !isNaN(Number(d.rate))
              );

              const totalAmount = validDetails.reduce(
                (sum, d) => sum + Number(d.qty) * Number(d.rate),
                0
              );

              const avgRate = validDetails.length
                ? (
                    validDetails.reduce((sum, d) => sum + Number(d.rate), 0) / validDetails.length
                  ).toFixed(2)
                : '0';

              const partyNames = [...new Set(entry.details.map((d) => supplierMap[d.supplier_id] || 'Unknown'))].join(', ');
              const routeNames = [...new Set(entry.details.map(d => d.route_name))].join(', ') || 'N/A';

              return (
                <tr key={entry.id} className="border-t">
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{routeNames}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{partyNames}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.particulars}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{avgRate}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{totalAmount < 0 ? 'Cr' : 'Dr'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RouteList;
