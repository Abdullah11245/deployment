'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import SaleDetailTable from './SaledetailTable';
import './Sale.css';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function EditSale({ saleId }) {
  const { id, voucher_id } = useParams();

  const [saleDate, setSaleDate] = useState('');
  const [partyId, setPartyId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [parties, setParties] = useState([]);
  const [saleDetails, setSaleDetails] = useState({});
  const [partyCode, setPartyCode] = useState('');
  const [partyName, setPartyName] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucherDetails = async () => {
      try {
        const response = await axios.get(`https://accounts-management.onrender.com/common/voucherDetail/main/${id}`);
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
        const saleResponse = await axios.get(`https://accounts-management.onrender.com/common/sale/sales/${voucher_id}`);
        const saleData = saleResponse.data;
        setSaleDate(saleData.sale_date);
        setPartyId(saleData.party_id);
        setTaxPercentage(saleData.tax_percentage);
        setTaxAmount(saleData.tax_amount);
        setNotes(saleData.notes);

        const partiesResponse = await axios.get('https://accounts-management.onrender.com/common/parties/getAll');
        const activeParties = partiesResponse.data.filter(party => party.status === 1);
        const partyOptions = activeParties.map(party => ({
          value: party.id,
          label: party.name,
          party_code: party.party_code,
        }));
        setParties(partyOptions);

        const selectedParty = partyOptions.find(p => p.value === saleData.party_id);
        if (selectedParty) {
          setPartyCode(selectedParty.party_code);
          setPartyName(selectedParty.label);
        }

        const saleDetailsResponse = await axios.get(`https://accounts-management.onrender.com/common/saleDetail/${voucher_id}`);
        setSaleDetails(saleDetailsResponse.data);
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [saleId, voucher_id]);

  useEffect(() => {
    if (!saleDetails) return;

    const weight = parseFloat(saleDetails.weight) || 0;
    const rate = parseFloat(saleDetails.rate) || 0;
    const adjustment = parseFloat(saleDetails.adjustment) || 0;

    const total = weight * rate + adjustment;
    setGrandTotal(total);

    const tax = (parseFloat(taxPercentage) || 0) * total / 100;
    setTaxAmount(tax.toFixed(2));
  }, [saleDetails, taxPercentage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
setLoading(true)    
    const payload = {
      sale_date: saleDate,
      party_id: partyId,
      tax_percentage: parseFloat(taxPercentage),
      tax_amount: parseFloat(taxAmount),
      notes,
    };
  
    try {
    
      await axios.put(`https://accounts-management.onrender.com/common/sale/sales/${saleId}`, payload);
  
      const voucherPayload = {
        voucher_id: saleId,
        voucher_type: 'SV',
        voucher_date: saleDate,
        note: notes,
      };
      console.log('Updating Voucher:', voucherPayload);
      await axios.put(`https://accounts-management.onrender.com/common/voucher/${saleId}`, voucherPayload);
  
      for (let i = 0; i < saleDetails.length; i++) {
        const detail = saleDetails[i];
        const particulars = `${detail.vehicle_no}: ${detail.itemLabel} ${detail.weight}KG@${detail.rate}`;
  
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
          particulars: `Sale of ${detail.itemLabel} to ${partyName}`,
          debit: 0,
          credit: grandTotal,
        };
  
        await axios.put(`https://accounts-management.onrender.com/common/voucherDetail/update/SV/${voucher_id}/${i}`, debitEntry);
  
        await axios.put(`https://accounts-management.onrender.com/common/voucherDetail/update/SV/${voucher_id}/${i + 1}`, creditEntry);
      }
  
      // Update sale details (loop through saleDetails array)
      for (let i = 0; i < saleDetails.length; i++) {
        const detail = saleDetails[i];
        const detailPayload = {
          item_id: detail.item_id,
          vehicle_no: detail.vehicle_no,
          frieght: parseFloat(detail.frieght || 0),
          uom: parseFloat(detail.uom),
          weight: parseFloat(detail.weight),
          rate: parseFloat(detail.rate),
          adjustment: parseFloat(detail.adjustment),
        };
  
        console.log(`Updating Sale Detail [${detail.item_id}]`, detailPayload);
        await axios.put(`https://accounts-management.onrender.com/common/saleDetail/${voucher_id}/${detail.item_id}`, detailPayload);
      }
  
      toast.success('Sale updated successfully');
    } catch (error) {
      setLoading(false)
      toast.error('Failed to update sale');
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
                  <Toaster position="top-right" reverseOrder={false} />
      
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
                  type="date-time-local"
                  value={saleDate}
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
                setGrandTotal={setGrandTotal}
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

export default EditSale;
