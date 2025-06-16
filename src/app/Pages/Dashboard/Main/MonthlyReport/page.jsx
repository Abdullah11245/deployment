'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Link from 'next/link';
import end_points from '../../../../api_url';

function Receiptreport() {
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [includedSuppliers, setIncludedSuppliers] = useState([]);
  const [excludedSuppliers, setExcludedSuppliers] = useState([]);
  const [includedRoutes, setIncludedRoutes] = useState([]);
  const [excludedRoutes, setExcludedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [vouchers, setVouchers] = useState([]);
const [allSuppliers, setAllSuppliers] = useState([]); // original unfiltered data
const [supplierPurchaseDetails, setSupplierPurchaseDetails] = useState({});
const fetchPurchaseDetailsInBatches = async (suppliers, concurrency = 5) => {
  const detailsMap = {};

  const queue = [...suppliers];
  const workers = [];

  const worker = async () => {
    while (queue.length) {
      const supplier = queue.shift();
      try {
        const response = await axios.get(`${end_points}/purchaseDetail/${supplier.id}`);
        const purchases = response.data;

        const totalQty = [purchases].reduce((sum, p) => sum + Number(p.qty || 0), 0);
        const totalAmount = [purchases].reduce((sum, p) => sum + (Number(p.qty || 0) * Number(p.rate || 0)), 0);
        const avgRate = totalQty > 0 ? totalAmount / totalQty : 0;

        detailsMap[supplier.id] = { weight: totalQty, rate: avgRate };
        console.log(`Fetched: ${supplier.id}`, detailsMap[supplier.id]);
      } catch (error) {
        console.error(`Error for ${supplier.id}:`, error.message);
        detailsMap[supplier.id] = { weight: 0, rate: 0 };
      }
    }
  };

  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return detailsMap;
};




useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch suppliers
      const suppliersRes = await axios.get(`${end_points}/suppliers/getAll`);
      const suppliers = suppliersRes.data.suppliers || [];

      setSupplierOptions(suppliers.map(s => ({ value: s.supplier_code, label: s.name })));

      const routesSet = new Set();
      const routeMap = {};

      suppliers.forEach(supplier => {
        const routeName = supplier.route?.name || 'N/A';
        routesSet.add(routeName);
        routeMap[supplier.supplier_code] = routeName;
      });

      setRouteOptions(Array.from(routesSet).map(route => ({ label: route, value: route })));
      setAllSuppliers(suppliers); // store full list for reset/reference
      setFilteredSuppliers(suppliers); // display initially

      // ✅ Fetch voucher details for each supplier in batches
      const fetchVoucherDetailsInBatches = async (suppliers, batchSize = 50) => {
        const allVoucherDetails = [];

        // Process suppliers in batches
        for (let i = 0; i < suppliers.length; i += batchSize) {
          const batch = suppliers.slice(i, i + batchSize);

          // Send requests for this batch in parallel
          const results = await Promise.allSettled(
            batch.map(supplier =>
              axios.get(`${end_points}/voucherDetail/mains/${supplier.supplier_code}`)
            )
          );

          // Handle successful and failed responses
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && Array.isArray(result.value.data)) {
              allVoucherDetails.push(...result.value.data);
            } else {
              const failedSupplier = batch[index];
              console.error(`Failed to fetch voucher details for supplier ${failedSupplier.supplier_code}:`, result.reason);
            }
          });
        }

        return allVoucherDetails;
      };

      // Fetch all voucher details in batches
      const allVoucherDetails = await fetchVoucherDetailsInBatches(suppliers);
      setVoucherDetails(allVoucherDetails);

      // ✅ Fetch all vouchers
      const voucherRes = await axios.get(`${end_points}/voucher/getAll`);
      setVouchers(voucherRes.data || []);

      // ✅ Fetch purchase details in batches
      const supplierPurchaseDetails = await fetchPurchaseDetailsInBatches(suppliers); 
      setSupplierPurchaseDetails(supplierPurchaseDetails);

    } catch (error) {
      console.error('Error fetching data:', error);
      
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);




  const handleSearch = () => {
    const includedSupplierIds = includedSuppliers.map(s => s.value);
    const excludedSupplierIds = excludedSuppliers.map(s => s.value);
    const includedRouteNames = includedRoutes.map(r => r.value);
    const excludedRouteNames = excludedRoutes.map(r => r.value);

    const filtered = allSuppliers.filter(supplier => {
      const routeName = supplier.route?.name || 'N/A';
      const supplierIncluded = includedSupplierIds.length === 0 || includedSupplierIds.includes(supplier.supplier_code);
      const supplierExcluded = excludedSupplierIds.length === 0 || !excludedSupplierIds.includes(supplier.supplier_code);
      const routeIncluded = includedRouteNames.length === 0 || includedRouteNames.includes(routeName);
      const routeExcluded = excludedRouteNames.length === 0 || !excludedRouteNames.includes(routeName);

      return supplierIncluded && supplierExcluded && routeIncluded && routeExcluded;
    });

    setFilteredSuppliers(filtered);
  };

const handleReset = () => {
  setIncludedSuppliers([]);
  setExcludedSuppliers([]);
  setIncludedRoutes([]);
  setExcludedRoutes([]);
  setFilteredSuppliers(allSuppliers); // restore original list
};

const getLastPaidJV = (accountCode) => {
  const jvWithDebit = voucherDetails
    .filter(v => v.account_code === accountCode && Number(v.debit) > 0);

  if (jvWithDebit.length > 0) {
    const latest = jvWithDebit[0];
    return {
      amount: Number(latest.debit) || 0,  // Ensure it's a number
      particulars: latest.particulars,
      voucher_number: latest.voucher_number || 'N/A',
    };
  }

  return { amount: 0, particulars: '', voucher_number: 'N/A' }; // Default values
};
const getCurrentBalance = (accountCode) => {
  const entries = voucherDetails.filter(v => v.account_code === accountCode);
  const totalDebit = entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

  return totalDebit - totalCredit;
};



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
    <div className="container mx-auto px-4 py-8 text-black">
      <h2 className="text-xl font-semibold mb-4">Supplier Route Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Included Suppliers</label>
          <Select className='mt-2' isMulti options={supplierOptions} value={includedSuppliers} onChange={setIncludedSuppliers} />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Suppliers</label>
          <Select className='mt-2' isMulti options={supplierOptions} value={excludedSuppliers} onChange={setExcludedSuppliers} />
        </div>
        <div>
          <label className="text-sm font-medium">Included Routes</label>
          <Select className='mt-2' isMulti options={routeOptions} value={includedRoutes} onChange={setIncludedRoutes} />
        </div>
        <div>
          <label className="text-sm font-medium">Excluded Routes</label>
          <Select className='mt-2' isMulti options={routeOptions} value={excludedRoutes} onChange={setExcludedRoutes} />
        </div>
      </div>

      <div className="mt-4">
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        <button onClick={handleReset} className="ml-2 bg-red-600 text-white px-4 py-2 rounded">Reset</button>
      </div>

      <div className="overflow-x-auto mt-6 bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-500 text-white text-sm font-semibold text-left">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Weight</th>
              <th className="px-4 py-2">paid</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2"> Amount</th>
              <th className='px-2 py-2 w-32 text-xs'>Previous Balance</th>
              <th className='px-2 py-2 w-32 text-xs'>Current Balance</th>

            </tr>
          </thead>
      <tbody className="text-sm text-gray-700">
  {filteredSuppliers.map((supplier, idx) => {
    const latestJVVoucher = voucherDetails.find(v => v.account_code === supplier.supplier_code && v.voucher_type === 'JV');
    const lastPaid = getLastPaidJV(supplier.supplier_code);
    const balance = getCurrentBalance(supplier.supplier_code);

    // Ensuring lastPaid is not null
    const lastPaidAmount = lastPaid ? lastPaid.amount : 0;

    // Accessing purchase details using supplier.supplier_code
    const purchaseDetails = supplierPurchaseDetails[supplier.id] || { weight: 0, rate: 0 };
    return (
      <tr key={supplier.supplier_code} className="border-b">
        <td className="px-4 py-2">{idx + 1}</td>
        <td className="px-4 py-2">
          <Link
            className="text-blue-600"
            href={`/Pages/Dashboard/Ledger/${supplier.supplier_code}`}
          >
            {supplier.name}
          </Link>
        </td>
        <td className="px-4 py-2">{supplier.route?.name || 'N/A'}</td>
        <td className="px-4 py-2">{purchaseDetails.weight.toFixed(2)}</td> {/* Weight */}
        <td className="px-4 py-2">
          {lastPaidAmount > 0 ? <div>{lastPaidAmount}</div> : '0'}
        </td>
        <td className="px-4 py-2">{purchaseDetails.rate.toFixed(2)}</td> {/* Rate */}
        <td className="px-4 py-2 font-medium">{balance.toLocaleString()}</td>
        <td className="px-4 py-2 font-medium">
          {(balance + lastPaidAmount).toLocaleString()}
        </td>
        <td className="px-4 py-2 font-medium">{balance.toLocaleString()}</td>
      </tr>
    );
  })}
</tbody>


        </table>
      </div>
    </div>
  );
}

export default Receiptreport;
