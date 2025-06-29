'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import SaleDetailTable from './SaledetailTable';
import './Sale.css';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../../../../api_url';

function EditSale() {
  const { id, voucher_id } = useParams();
   
  const [saleDate, setSaleDate] = useState('');
  const [partyId, setPartyId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [parties, setParties] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [partyCode, setPartyCode] = useState('');
  const [partyName, setPartyName] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucherDetails = async () => {
      try {
        const response = await axios.get(`${end_points}/voucherDetail/main/${id}`);
        setVoucherDetails(response.data);
      } catch (error) {
        console.error('Error fetching voucher details:', error);
      }
    };

    fetchVoucherDetails();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch main sale info
        const saleResponse = await axios.get(`${end_points}/sale/sales/${voucher_id}`);
        const saleData = saleResponse.data;
        setSaleDate(saleData.sale_date?.split('T')[0] || ''); // Format YYYY-MM-DD
        setPartyId(saleData.party_id);
        setTaxPercentage(saleData.tax_percentage);
        setTaxAmount(saleData.tax_amount);
        setNotes(saleData.notes);

        // Fetch parties list
        const partiesResponse = await axios.get(`${end_points}/parties/getAll`);
        const activeParties = partiesResponse.data.filter(party => party.status === 1);
        const partyOptions = activeParties.map(party => ({
          value: party.id,
          label: party.name,
          party_code: party.party_code,
        }));
        setParties(partyOptions);

        // Set selected party details
        const selectedParty = partyOptions.find(p => p.value === saleData.party_id);
        if (selectedParty) {
          setPartyCode(selectedParty.party_code);
          setPartyName(selectedParty.label);
        }

        // Fetch sale details (handle single object or array)
        const saleDetailsResponse = await axios.get(`${end_points}/saleDetail/${voucher_id}`);
          console.log('Fetched sale details:', saleDetailsResponse.data);
        const rawDetails = saleDetailsResponse.data;
        let detailsArray = [];

        if (Array.isArray(rawDetails)) {
          detailsArray = rawDetails;
        } else if (rawDetails && typeof rawDetails === 'object') {
          detailsArray = [rawDetails]; // wrap single object into array
        } else {
          console.error('Unexpected saleDetails format:', rawDetails);
          detailsArray = [];
        }

        // Add original_item_id for tracking item changes
        const withOriginalIds = detailsArray.map(detail => ({
          ...detail,
          original_item_id: detail.item_id,
        }));

        setSaleDetails(withOriginalIds);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id, voucher_id]);

  useEffect(() => {
    if (!saleDetails || saleDetails.length === 0) return;

    // Calculate subtotal and tax amounts from saleDetails
    let totalSum = 0;
    saleDetails.forEach(detail => {
      const weight = parseFloat(detail.weight) || 0;
      const rate = parseFloat(detail.rate) || 0;
      const adjustment = parseFloat(detail.adjustment) || 0;
      const freight = parseFloat(detail.frieght) || 0;

      const total = weight * rate + adjustment - freight;
      totalSum += total;
    });

    setGrandTotal(totalSum);

    const tax = (parseFloat(taxPercentage) || 0) * totalSum / 100;
    setTaxAmount(tax.toFixed(2));
  }, [saleDetails, taxPercentage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update main sale record
      const payload = {
        sale_date: saleDate,
        party_id: partyId,
        tax_percentage: parseFloat(taxPercentage),
        tax_amount: parseFloat(taxAmount),
        notes,
      };
      await axios.put(`${end_points}/sale/sales/${id}`, payload);

      // Update voucher main record
      const voucherPayload = {
        voucher_id: id,
        voucher_type: 'SV',
        voucher_date: saleDate,
        note: notes,
      };
      await axios.put(`${end_points}/voucher/${id}`, voucherPayload);

      // Update voucher detail entries
      for (let i = 0; i < saleDetails.length; i++) {
        const detail = saleDetails[i];
        const particulars = `${detail.vehicle_no}: ${detail.itemLabel || ''} ${detail.weight}KG@${detail.rate}`;

        const debitEntry = {
          main_id: id,
          account_code: partyCode,
          particulars,
          debit: grandTotal,
          credit: 0,
        };

        const creditEntry = {
          main_id: id,
          account_code: '1140001',
          particulars: `Sale of ${detail.itemLabel || ''} to ${partyName}`,
          debit: 0,
          credit: grandTotal,
        };

        await axios.put(`${end_points}/voucherDetail/update/SV/${voucher_id}/${i}`, debitEntry);
        await axios.put(`${end_points}/voucherDetail/update/SV/${voucher_id}/${i + 1}`, creditEntry);
      }
      for (let i = 0; i < saleDetails.length; i++) {
        const detail = saleDetails[i];
        const detailPayload = {
          item_id: detail.item_id,
          vehicle_no: detail.vehicle_no,
          frieght: parseFloat(detail.frieght || 0),
          uom: detail.uom,
          weight: parseFloat(detail.weight),
          rate: parseFloat(detail.rate),
          adjustment: parseFloat(detail.adjustment),
        };

        // Use detail.original_item_id for the URL if needed (depends on your API)
        await axios.put(`${end_points}/saleDetail/${voucher_id}/${detail.original_item_id}`, detailPayload);
      }

      setLoading(false);
      toast.success('Sale updated successfully');
    } catch (error) {
      setLoading(false);
      toast.error('Failed to update sale');
      console.error('Update sale error:', error);
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
    <div className="container mx-auto px-2 py-8 text-black">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex justify-between items-center mb-0 border-b-2 pb-4 px-4">
        <h2 className="text-xl font-semibold text-gray-700">Edit Sale</h2>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="mx-auto w-full bg-white">
          <div>
            <label className="mb-3 block text-base font-medium text-[#07074D]">Sale ID</label>
            <div className="w-36 h-12 bg-gray-200 rounded-md flex items-center justify-center mb-6">
              <h2 className="text-xl text-gray-700">{voucher_id}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4 mb-5">
              <div className="mb-5 w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Sale Date</label>
                <input
                  type="date"
                  value={saleDate || ''}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-300 focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Party</label>
                <Select
                  options={parties}
                  value={parties.find(p => p.value === partyId)}
                  onChange={(selectedOption) => {
                    setPartyId(selectedOption.value);
                    setPartyCode(selectedOption.party_code);
                    setPartyName(selectedOption.label);
                  }}
                  placeholder="Select Party"
                  className="w-full rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mb-5 w-full">
              <SaleDetailTable
                saleDetails={saleDetails}
                setSaleDetails={setSaleDetails}
                taxPercentage={taxPercentage}
                setTaxPercentage={setTaxPercentage}
                taxAmount={taxAmount}
                setGrandTotal={setGrandTotal}
              />
            </div>

            <div className="mb-5 mt-10">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                required
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-3 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md min-h-36 max-w-1/2"
              />
            </div>

            <div className="w-full mt-8">
              <button
                type="submit"
                className="hover:shadow-form rounded-md bg-[#3B82F6] w-1/4 py-3 text-base font-semibold text-white outline-none"
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

export default EditSale;
