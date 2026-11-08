'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_BCV_RATE, getClientBcvRate, formatBs, formatDualPrice } from '../utils/bcvRates';

interface BcvContextType {
  bcvRate: number;
  bcvDate: string;
  source: string;
  isLoading: boolean;
  refreshRate: () => Promise<void>;
  toBs: (usd: number) => string;
  toDual: (usd: number) => string;
}

const BcvContext = createContext<BcvContextType>({
  bcvRate: DEFAULT_BCV_RATE,
  bcvDate: '',
  source: 'BCV Oficial',
  isLoading: false,
  refreshRate: async () => {},
  toBs: (usd: number) => formatBs(usd, DEFAULT_BCV_RATE),
  toDual: (usd: number) => formatDualPrice(usd, DEFAULT_BCV_RATE),
});

export function BcvProvider({ children }: { children: React.ReactNode }) {
  const [bcvRate, setBcvRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bukea_bcv_rate');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return DEFAULT_BCV_RATE;
  });

  const [bcvDate, setBcvDate] = useState<string>('');
  const [source, setSource] = useState<string>('BCV Oficial');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshRate = async () => {
    setIsLoading(true);
    const data = await getClientBcvRate();
    if (data.rate) {
      setBcvRate(data.rate);
      setBcvDate(data.date);
      setSource(data.source);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshRate();
  }, []);

  const toBs = (usd: number) => formatBs(usd, bcvRate);
  const toDual = (usd: number) => formatDualPrice(usd, bcvRate);

  return (
    <BcvContext.Provider
      value={{
        bcvRate,
        bcvDate,
        source,
        isLoading,
        refreshRate,
        toBs,
        toDual,
      }}
    >
      {children}
    </BcvContext.Provider>
  );
}

export function useBcv() {
  return useContext(BcvContext);
}
