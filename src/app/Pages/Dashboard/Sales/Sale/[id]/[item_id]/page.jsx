'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Select from 'react-select';
import SaleDetailTable from './SaledetailTable';
import './Sale.css';
import toast, { Toaster } from 'react-hot-toast';

function CreateSale() {
  const { id: saleId, item_id: itemId } = useParams(); // Get both IDs from URL

  const [saleDate, setSaleDate] = useState('');
  const [partyId, setPartyId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [parties, setParties] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Loading state

  // Fetch Party List
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await axios.get('https://accounts-management.onrender.com/common/parties/getAll');
        const partyOptions = response.data.map(party => ({
          value: party.id,
          label: party.name,
        }));
        setParties(partyOptions);
      } catch (error) {
        console.error('Error fetching parties:', error);
      }
    };

    fetchParties();
  }, []);

  // Fetch Sale & SaleDetail for editing
  useEffect(() => {
    const fetchSale = async () => {
      if (!saleId || !itemId) return;

      try {
        // Fetch sale
        const { data: saleData } = await axios.get(
          `https://accounts-management.onrender.com/common/sale/sales/${saleId}`
        );

        setSaleDate(new Date(saleData.sale_date).toISOString().slice(0, 16));
        setPartyId({ value: saleData.party_id, label: saleData.party_name || 'Party' });
        setTaxPercentage(saleData.tax_percentage.toString());
        setTaxAmount(saleData.tax_amount.toString());
        setNotes(saleData.notes);

        // Fetch sale detail
        const detailRes = await axios.get(
          `https://accounts-management.onrender.com/common/saleDetail/${saleId}/${itemId}`
        );
        const detail = detailRes.data;

        const formattedDetail = {
          itemId: detail.item_id,
          vehicleNo: detail.vehicle_no,
          frieght: detail.frieght,
          uom: detail.uom,
          weight: detail.weight,
          rate: detail.rate,
          adjustment: detail.adjustment,
        };
        setLoading(false)
        setSaleDetails([formattedDetail]); // must be an array
      } catch (err) {
        setLoading(false)

        console.error('Error loading sale or detail:', err);
      }
    };

    fetchSale();
  }, [saleId, itemId]);

  // Auto-calculate taxAmount
  useEffect(() => {
    const total = saleDetails.reduce((acc, detail) => {
      const weight = parseFloat(detail.weight) || 0;
      const rate = parseFloat(detail.rate) || 0;
      const adjustment = parseFloat(detail.adjustment) || 0;
      return acc + (weight * rate + adjustment);
    }, 0);

    const tax = (parseFloat(taxPercentage) || 0) * total / 100;
    setTaxAmount(tax.toFixed(2));
  }, [saleDetails, taxPercentage]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
   setLoading(true)
    const payload = {
      sale_date: saleDate,
      party_id: partyId?.value,
      tax_percentage: parseFloat(taxPercentage),
      tax_amount: parseFloat(taxAmount),
      notes: notes,
    };

    try {
      // Update sale
      await axios.put(
        `https://accounts-management.onrender.com/common/sale/sales/${saleId}`,
        payload
      );

      // Update specific sale detail
      const detail = saleDetails[0];
      const detailPayload = {
        sale_id: saleId,
        item_id: detail.itemId,
        vehicle_no: detail.vehicleNo,
        frieght: parseFloat(detail.frieght || 0),
        uom: parseFloat(detail.uom),
        weight: parseFloat(detail.weight),
        rate: parseFloat(detail.rate),
        adjustment: parseFloat(detail.adjustment),
      };

      await axios.put(
        `https://accounts-management.onrender.com/common/saleDetail/${saleId}/${detail.itemId}`,
        detailPayload
      );

      toast.success('Sale and detail updated successfully');
      setLoading(false)

    } catch (error) {
      console.error('Error:', error);
      setLoading(false)
      toast.error('Error while submitting the form');
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4">
        <h2 className="text-xl font-semibold text-gray-700">Edit Sale</h2>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4 mb-5">
              <div className="mb-5 w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Sale Date</label>
                <input
                  type="datetime-local"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Party</label>
                <Select
                  options={parties}
                  value={partyId}
                  onChange={setPartyId}
                  placeholder="Select Party"
                  className="w-full rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-5">
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Tax Percentage (%)</label>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Tax Amount</label>
                <input
                  type="number"
                  value={taxAmount}
                  readOnly
                  required
                  className="w-full bg-gray-100 cursor-not-allowed rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280]"
                />
              </div>
            </div>

            <div className="mb-5 w-full">
              <SaleDetailTable
                saleDetails={saleDetails}
                setSaleDetails={setSaleDetails}
                taxPercentage={taxPercentage}
                taxAmount={taxAmount}
              />
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
            </div>

            <div className="w-full mt-8">
              <button
                type="submit"
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none"
              >
                Update Sale
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSale;
