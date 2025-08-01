import { useState, useEffect } from 'react';
import { ChitFund } from '@/types/chitfund';

const STORAGE_KEY = 'chitfunds';

export const useChitFundStorage = () => {
  const [chitFunds, setChitFunds] = useState<ChitFund[]>([]);

  // Load chit funds from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setChitFunds(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading chit funds:', error);
      }
    }
  }, []);

  // Save to localStorage whenever chitFunds changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chitFunds));
  }, [chitFunds]);

  const addChitFund = (chitFund: ChitFund) => {
    setChitFunds(prev => [...prev, chitFund]);
  };

  const updateChitFund = (updatedChitFund: ChitFund) => {
    setChitFunds(prev => 
      prev.map(cf => cf.id === updatedChitFund.id ? updatedChitFund : cf)
    );
  };

  const deleteChitFund = (id: string) => {
    setChitFunds(prev => prev.filter(cf => cf.id !== id));
  };

  return {
    chitFunds,
    addChitFund,
    updateChitFund,
    deleteChitFund
  };
};