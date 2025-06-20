'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import SaleDetailTable from './SaledetailTable';
import './Sale.css';
import toast, { Toaster } from 'react-hot-toast';
import end_points from '../../../../../api_url';

function CreateSale() {
  const [saleDate, setSaleDate] = useState('');
  const [partyId, setPartyId] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [parties, setParties] = useState([]);
  const [saleDetails, setSaleDetails] = useState([]);
  const [isFormValid, setIsFormValid] = useState(true); // Form validity state
  const [latestSaleId, setLatestSaleId] = useState(null);
  const [partyCode, setPartyCode] = useState('');
  const [partyName, setPartyName] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partiesResponse = await axios.get(`${end_points}/parties/getAll`);
        const activeParties = partiesResponse.data.filter(party => party.status === 1);
        const partyOptions = activeParties.map(party => ({
          value: party.id,
          label: party.name,
          party_code: party.party_code,
        }));
        setParties(partyOptions);

        const saleIdResponse = await axios.get(`${end_points}/sale/latest-id`);
        setLatestSaleId(saleIdResponse.data.latest_sale_id +1); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const total = saleDetails.reduce((acc, detail) => {
      const weight = parseFloat(detail.weight) || 0;
      const rate = parseFloat(detail.rate) || 0;
      const adjustment = parseFloat(detail.adjustment) || 0;
      const freight = parseFloat(detail.frieght || detail.freight) || 0;
      return acc + (weight * rate + adjustment - freight);
    }, 0);
  
    const tax = (parseFloat(taxPercentage) || 0) * total / 100;
    setTaxAmount(tax.toFixed(2));
  }, [saleDetails, taxPercentage]); // ✅ Added taxPercentage
  

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log(taxPercentage)
    const allFieldsFilled = saleDetails.every(detail =>
      detail.weight && detail.rate && detail.adjustment && detail.uom && detail.itemId && detail.vehicleNo
    );
  

  
    if (!saleDate || !partyId || !taxPercentage || !allFieldsFilled) {
      setIsFormValid(false);
      return;
    }
  
    const payload = {
      sale_date: saleDate,
      party_id: partyId,
      tax_percentage: parseFloat(taxPercentage),
      tax_amount: parseFloat(taxAmount),
      notes: notes,
    };
  
    try {
      const response = await axios.post(`${end_points}/sale/create`, payload);
  
      if (response.data?.message === 'Sale created successfully') {
        const saleId = response.data?.result?.insertId;
       
        const voucherPayload = {
          voucher_id: saleId, 
          voucher_type: "SV", 
          voucher_date: saleDate,
          note: notes, 
        };
    
        const voucherResponse = await axios.post(
          `${end_points}/voucher/create`,
          voucherPayload
        );
        const voucherId = voucherResponse.data?.id;
        for (const detail of saleDetails) {
          const particulars = `${detail.vehicleNo}: ${detail.itemLabel} ${detail.weight}KG@${detail.rate}`;
           
          const debitEntry = {
            main_id: voucherId,
            account_code: partyCode,
            particulars,
            debit: grandTotal,
            credit: 0,
          };
          const creditEntry = {
            main_id: voucherId,
            account_code: "1140001",
            particulars: `Sale of ${detail.itemLabel} to ${partyName}`,
            debit: 0,
            credit: grandTotal,
            
          };
          try {
            await axios.post(
              `${end_points}/voucherDetail/create`,
              debitEntry
            );
        
            await axios.post(
              `${end_points}/voucherDetail/create`,
              creditEntry
            );
            
          } catch (error) {
            console.error("Error creating voucher detail for item:", detail, error);
          }
        }
        

        const saleDetailRequests = saleDetails.map(detail => {
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
          return axios.post(`${end_points}/saleDetail/create`, detailPayload);
        });
  
      const res=  await Promise.all(saleDetailRequests);
      res.forEach((r, i) => {
      
      });
        setSaleDate('');
        setPartyId(null);
        setTaxPercentage('');
        setTaxAmount('');
        setNotes('');
        setSaleDetails([]);
  
       toast.success("Voucher created successfully");
      } else {
        toast.error('Failed to create sale');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error while submitting the form');
    }
  };
  

  // Check validity of form (SaleDate, Party, TaxPercentage, and SaleDetails)
  const checkFormValidity = () => {
    const allFieldsFilled = saleDetails.every(detail =>
      detail.weight && detail.rate && detail.adjustment && detail.uom && detail.itemId && detail.vehicleNo
    );


    return saleDate && partyId && taxPercentage && allFieldsFilled;
  };

  return (
    <div className="container mx-auto px-2 py-8">
      <div className="flex justify-between items-center mb-0 border-b-2 pb-4 px-4">
        <h2 className="text-xl font-semibold text-gray-700">Create New Sale</h2>
      </div>
              <Toaster position="top-right" reverseOrder={false} />
      <div className="flex items-center justify-center p-4">
      
        <div className="mx-auto w-full bg-white">
          <form onSubmit={handleSubmit}>
            <div>
              <label className="mb-3 block text-base font-medium text-[#07074D]">Sale ID</label>
              <div className='w-36 h-12 bg-gray-200 rounded-md flex items-center justify-center mb-6'>
                <h2 className="text-xl  text-gray-700">{latestSaleId }</h2>
              </div>
            </div>

          
            <div className="flex items-center space-x-4 mb-5">
              {/* Sale Date */}
              <div className="mb-5 w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Sale Date</label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-blue-300 focus:shadow-md"
                />
              </div>

              {/* Party Dropdown */}
              <div className="mb-5 w-full">
                <label className="mb-3 block text-base font-medium text-black">Party</label>
                  <Select
                  options={parties}
                  value={parties.find(p => p.value === partyId)}
                  onChange={(selectedOption) => {
                    setPartyId(selectedOption.value);
                    setPartyCode(selectedOption.party_code);
                    setPartyName(selectedOption.label);
                  }}
                  placeholder="Select Party"
                  className="w-full rounded-md text-black"
                  required
                />

              </div>
            </div>
            {/* <div className="flex items-center space-x-4 mb-5"> */}
              {/* <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Tax Percentage (%)</label>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div> */}

              {/* <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">Tax Amount</label>
                <input
                  type="number"
                  value={taxAmount}
                  readOnly
                  required
                  className="w-full bg-gray-100 cursor-not-allowed rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280]"
                />
              </div> */}
            {/* </div> */}
            <div className="mb-5 w-full">
              <SaleDetailTable
                saleDetails={saleDetails}
                setSaleDetails={setSaleDetails}
                taxPercentage={taxPercentage}
                setTaxPercentage={setTaxPercentage} // ✅ Add this
                taxAmount={taxAmount}
                setGrandTotal={setGrandTotal}
              />
            </div>

            {/* Notes */}
            <div className="mb-5 mt-10">
              <label className="mb-3 block text-base font-medium text-[#07074D]">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Notes'
                required
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-3 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md  min-h-36 max-w-1/2"
              />
            </div>

            {/* Submit Button */}
            <div className="w-full mt-8">
              <button
                type="submit"
                className={`hover:shadow-form rounded-md bg-[#3B82F6] w-1/2 py-3 px-8 text-center text-base font-semibold text-white outline-none }`}
              // Disable if any field is empty
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSale;
