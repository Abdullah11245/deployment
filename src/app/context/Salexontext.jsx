 'use client';
import React, { createContext, useState, useContext } from 'react';

const SaleContext = createContext();

export const SaleProvider = ({ children }) => {
  const [editSaleDetails, setEditSaleDetails] = useState([]);

  return (
    <SaleContext.Provider value={{ editSaleDetails, setEditSaleDetails }}>
      {children}
    </SaleContext.Provider>
  );
};

export const useSaleContext = () => useContext(SaleContext);
