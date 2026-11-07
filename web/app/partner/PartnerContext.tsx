'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PARTNER_DATA,
  PartnerBusinessProfile,
  PartnerDish,
  PartnerReservation,
  PartnerTable,
  WaitlistEntry,
} from './data/partnerData';

interface PartnerContextType {
  activeBusinessId: string;
  setActiveBusinessId: (id: string) => void;
  business: PartnerBusinessProfile;
  toggleReservationsPause: (paused?: boolean, until?: string) => void;
  addManualReservation: (res: Omit<PartnerReservation, 'id' | 'paidViaBukeaPay'>) => void;
  updateTableStatus: (tableId: string, status: PartnerTable['status']) => void;
  updateBusinessProfile: (partial: Partial<PartnerBusinessProfile>) => void;
  // Menu CRUD
  addDish: (dish: Omit<PartnerDish, 'id'>) => void;
  updateDish: (dishId: string, partial: Partial<PartnerDish>) => void;
  deleteDish: (dishId: string) => void;
  reorderDish: (dishId: string, direction: 'up' | 'down') => void;
  toggleDishAvailability: (dishId: string) => void;
  // Waitlist
  addWaitlistEntry: (entry: Omit<WaitlistEntry, 'id' | 'status' | 'waitMinutes'>) => void;
  updateWaitlistStatus: (id: string, status: WaitlistEntry['status']) => void;
  // Reservation status
  updateReservationStatus: (id: string, status: PartnerReservation['status']) => void;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, PartnerBusinessProfile>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bukea_partner_data_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading partner data from localStorage:', e);
        }
      }
    }
    return INITIAL_PARTNER_DATA;
  });

  const [activeBusinessId, setActiveBusinessId] = useState<string>('downtown-beach-club');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bukea_partner_data_v1', JSON.stringify(data));
    }
  }, [data]);

  const business = data[activeBusinessId] || INITIAL_PARTNER_DATA['downtown-beach-club'];

  const updateActiveBusiness = (updater: (prev: PartnerBusinessProfile) => PartnerBusinessProfile) => {
    setData((prev) => {
      const current = prev[activeBusinessId] || INITIAL_PARTNER_DATA[activeBusinessId];
      return {
        ...prev,
        [activeBusinessId]: updater(current),
      };
    });
  };

  const toggleReservationsPause = (paused?: boolean, until?: string) => {
    updateActiveBusiness((b) => {
      const nextPaused = paused !== undefined ? paused : !b.isReservationsPaused;
      return {
        ...b,
        isReservationsPaused: nextPaused,
        pausedUntil: nextPaused ? until || 'Hasta nuevo aviso' : undefined,
      };
    });
  };

  const addManualReservation = (res: Omit<PartnerReservation, 'id' | 'paidViaBukeaPay'>) => {
    const newReservation: PartnerReservation = {
      ...res,
      id: `res-${Date.now()}`,
      paidViaBukeaPay: false,
    };
    updateActiveBusiness((b) => ({
      ...b,
      reservations: [newReservation, ...b.reservations],
      // Si tiene mesa asignada, actualizar mesa
      tables: b.tables.map((t) => {
        if (t.number === res.tableOrSlot || res.tableOrSlot.startsWith(t.number)) {
          return {
            ...t,
            status: 'reservada',
            currentGuest: {
              name: res.guestName,
              pax: res.pax,
              time: res.time,
              tier: res.userTier,
              notes: res.specialRequest,
            },
          };
        }
        return t;
      }),
    }));
  };

  const updateTableStatus = (tableId: string, status: PartnerTable['status']) => {
    updateActiveBusiness((b) => ({
      ...b,
      tables: b.tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            currentGuest: status === 'libre' ? undefined : t.currentGuest,
          };
        }
        return t;
      }),
    }));
  };

  const updateBusinessProfile = (partial: Partial<PartnerBusinessProfile>) => {
    updateActiveBusiness((b) => ({
      ...b,
      ...partial,
    }));
  };

  const addDish = (dish: Omit<PartnerDish, 'id'>) => {
    const newDish: PartnerDish = {
      ...dish,
      id: `dish-${Date.now()}`,
    };
    updateActiveBusiness((b) => ({
      ...b,
      dishes: [...b.dishes, newDish],
    }));
  };

  const updateDish = (dishId: string, partial: Partial<PartnerDish>) => {
    updateActiveBusiness((b) => ({
      ...b,
      dishes: b.dishes.map((d) => (d.id === dishId ? { ...d, ...partial } : d)),
    }));
  };

  const deleteDish = (dishId: string) => {
    updateActiveBusiness((b) => ({
      ...b,
      dishes: b.dishes.filter((d) => d.id !== dishId),
    }));
  };

  const reorderDish = (dishId: string, direction: 'up' | 'down') => {
    updateActiveBusiness((b) => {
      const index = b.dishes.findIndex((d) => d.id === dishId);
      if (index === -1) return b;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= b.dishes.length) return b;

      const newDishes = [...b.dishes];
      const [moved] = newDishes.splice(index, 1);
      newDishes.splice(targetIndex, 0, moved);

      return {
        ...b,
        dishes: newDishes,
      };
    });
  };

  const toggleDishAvailability = (dishId: string) => {
    updateActiveBusiness((b) => ({
      ...b,
      dishes: b.dishes.map((d) => (d.id === dishId ? { ...d, isAvailable: !d.isAvailable } : d)),
    }));
  };

  const addWaitlistEntry = (entry: Omit<WaitlistEntry, 'id' | 'status' | 'waitMinutes'>) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `w-${Date.now()}`,
      status: 'esperando',
      waitMinutes: 0,
    };
    updateActiveBusiness((b) => ({
      ...b,
      waitlist: [...b.waitlist, newEntry],
    }));
  };

  const updateWaitlistStatus = (id: string, status: WaitlistEntry['status']) => {
    updateActiveBusiness((b) => ({
      ...b,
      waitlist: b.waitlist.map((w) => (w.id === id ? { ...w, status } : w)),
    }));
  };

  const updateReservationStatus = (id: string, status: PartnerReservation['status']) => {
    updateActiveBusiness((b) => ({
      ...b,
      reservations: b.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  };

  return (
    <PartnerContext.Provider
      value={{
        activeBusinessId,
        setActiveBusinessId,
        business,
        toggleReservationsPause,
        addManualReservation,
        updateTableStatus,
        updateBusinessProfile,
        addDish,
        updateDish,
        deleteDish,
        reorderDish,
        toggleDishAvailability,
        addWaitlistEntry,
        updateWaitlistStatus,
        updateReservationStatus,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
}
