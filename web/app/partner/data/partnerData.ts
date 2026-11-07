export type BusinessSpaceType = 'mesas' | 'capacidad';

export interface TableZone {
  id: string;
  name: string;
}

export type TableStatus = 'libre' | 'reservada' | 'ocupada' | 'cuenta_pedida' | 'bloqueada';

export interface PartnerTable {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  status: TableStatus;
  currentGuest?: {
    name: string;
    pax: number;
    time: string;
    tier: 'Explorador' | 'Foodie' | 'VIP Gourmet' | 'Prime';
    notes?: string;
  };
}

export interface CapacitySlot {
  time: string;
  reserved: number;
  capacity: number;
  label?: string;
}

export interface PartnerReservation {
  id: string;
  guestName: string;
  phone: string;
  pax: number;
  date: string;
  time: string;
  tableOrSlot: string;
  status: 'confirmada' | 'en_camino' | 'sentada' | 'completada' | 'no_show';
  userTier: 'Explorador' | 'Foodie' | 'VIP Gourmet' | 'Prime';
  deposit: number; // USD
  paidViaBukeaPay: boolean;
  specialRequest?: string;
}

export interface WaitlistEntry {
  id: string;
  guestName: string;
  phone: string;
  pax: number;
  zoneRequested: string;
  waitMinutes: number;
  status: 'esperando' | 'notificado' | 'sentado' | 'cancelado';
}

export interface PartnerDish {
  id: string;
  name: string;
  category: string;
  priceUSD: number;
  desc: string;
  photo: string;
  ingredients: string[];
  isAvailable: boolean;
  badge?: string;
}

export interface PartnerBusinessProfile {
  id: string;
  name: string;
  slug: string;
  category: 'Restaurante' | 'Club de Playa' | 'Discoteca' | 'Bar' | 'Gym' | 'Hotel' | 'Spa';
  cuisineOrSpecialty: string; // ej. "Comida Fusión del Mar" o "Entrenamiento Funcional"
  spaceType: BusinessSpaceType;
  description: string;
  address: string;
  zone: string;
  phone: string;
  whatsapp: string;
  logo: string;
  heroImage: string;
  gallery: string[];
  schedule: {
    days: string;
    hours: string;
  }[];
  toleranceMinutes: number;
  pacingMaxGuestsPer15Min: number; // Límite de comensales cada 15 min (Pacing inspirado en OpenResto)
  tableTurnaroundMinutes: number; // Tiempo promedio de rotación de mesa (ej. 90 min)
  isReservationsPaused: boolean;
  pausedUntil?: string;
  totalCapacity: number; // Para modo capacidad
  bukeaPointsDebtUSD: number; // Monto que Bukea le debe al restaurante por puntos canjeados
  aiSettings: {
    whatsappAutoReply: boolean;
    reviewsAutoReply: boolean;
    reviewsTone: 'elegante' | 'calido' | 'casual';
    onlyPositiveReviewsAutoReply: boolean;
  };
  tables: PartnerTable[];
  capacitySlots: CapacitySlot[];
  reservations: PartnerReservation[];
  waitlist: WaitlistEntry[];
  dishes: PartnerDish[];
}

export const INITIAL_PARTNER_DATA: Record<string, PartnerBusinessProfile> = {
  'downtown-beach-club': {
    id: 'downtown-beach-club',
    name: 'Downtown Beach Club',
    slug: 'downtown-beach-club',
    category: 'Club de Playa',
    cuisineOrSpecialty: 'Comida de Playa & Fusión Marina',
    spaceType: 'mesas',
    description: 'El club de playa más exclusivo de Pampatar. Coctelería de autor, camas balinesas frente al mar caribeño y gastronomía marina contemporánea.',
    address: 'Bahía de Pampatar, Calle La Marina, Nueva Esparta',
    zone: 'Pampatar',
    phone: '+58 295 262 1100',
    whatsapp: '+58 412 800 2020',
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=800&q=80',
    ],
    schedule: [
      { days: 'Miércoles a Domingo', hours: '11:00 AM - 01:00 AM' },
      { days: 'Lunes y Martes', hours: 'Cerrado (Mantenimiento)' },
    ],
    toleranceMinutes: 15,
    pacingMaxGuestsPer15Min: 12,
    tableTurnaroundMinutes: 90,
    isReservationsPaused: false,
    totalCapacity: 120,
    bukeaPointsDebtUSD: 340.00, // $340 USD en puntos que comensales usaron y Bukea le debe pagar
    aiSettings: {
      whatsappAutoReply: true,
      reviewsAutoReply: true,
      reviewsTone: 'elegante',
      onlyPositiveReviewsAutoReply: true,
    },
    tables: [
      { id: 't1', number: 'M-01', zone: 'Terraza Marina', capacity: 4, status: 'ocupada', currentGuest: { name: 'Carlos Mendoza', pax: 4, time: '13:30', tier: 'Prime', notes: 'Mesa con sombra' } },
      { id: 't2', number: 'M-02', zone: 'Terraza Marina', capacity: 2, status: 'reservada', currentGuest: { name: 'Elena Rivas', pax: 2, time: '14:00', tier: 'Foodie' } },
      { id: 't3', number: 'M-03', zone: 'Terraza Marina', capacity: 6, status: 'cuenta_pedida', currentGuest: { name: 'Andrés Gil', pax: 5, time: '12:45', tier: 'Explorador' } },
      { id: 't4', number: 'M-04', zone: 'Terraza Marina', capacity: 4, status: 'libre' },
      { id: 'b1', number: 'BAL-01', zone: 'Camas Balinesas Frente al Mar', capacity: 6, status: 'ocupada', currentGuest: { name: 'Sofía Valero', pax: 6, time: '11:30', tier: 'VIP Gourmet', notes: 'Champagne Moët listo' } },
      { id: 'b2', number: 'BAL-02', zone: 'Camas Balinesas Frente al Mar', capacity: 6, status: 'reservada', currentGuest: { name: 'Rodrigo Paez', pax: 5, time: '15:00', tier: 'Prime' } },
      { id: 'b3', number: 'BAL-03', zone: 'Camas Balinesas Frente al Mar', capacity: 4, status: 'libre' },
      { id: 'v1', number: 'VIP-A', zone: 'Salón VIP Climatizado', capacity: 8, status: 'libre' },
      { id: 'v2', number: 'VIP-B', zone: 'Salón VIP Climatizado', capacity: 10, status: 'reservada', currentGuest: { name: 'Grupo Polar', pax: 10, time: '19:30', tier: 'VIP Gourmet' } },
      { id: 'bar1', number: 'BAR-01', zone: 'Barra Coctelería', capacity: 2, status: 'ocupada' },
      { id: 'bar2', number: 'BAR-02', zone: 'Barra Coctelería', capacity: 2, status: 'libre' },
      { id: 'bar3', number: 'BAR-03', zone: 'Barra Coctelería', capacity: 2, status: 'bloqueada' },
    ],
    capacitySlots: [],
    reservations: [
      { id: 'res-1', guestName: 'Carlos Mendoza', phone: '+58 412 1234567', pax: 4, date: 'Hoy', time: '13:30', tableOrSlot: 'M-01 (Terraza)', status: 'sentada', userTier: 'Prime', deposit: 1.00, paidViaBukeaPay: true, specialRequest: 'Cerca a la orilla' },
      { id: 'res-2', guestName: 'Elena Rivas', phone: '+58 414 7654321', pax: 2, date: 'Hoy', time: '14:00', tableOrSlot: 'M-02 (Terraza)', status: 'en_camino', userTier: 'Foodie', deposit: 1.00, paidViaBukeaPay: true },
      { id: 'res-3', guestName: 'Rodrigo Paez', phone: '+58 424 9988776', pax: 5, date: 'Hoy', time: '15:00', tableOrSlot: 'BAL-02 (Balinesa)', status: 'confirmada', userTier: 'Prime', deposit: 1.00, paidViaBukeaPay: true },
      { id: 'res-4', guestName: 'Grupo Polar (Marcos)', phone: '+58 412 5551122', pax: 10, date: 'Hoy', time: '19:30', tableOrSlot: 'VIP-B (Salón VIP)', status: 'confirmada', userTier: 'VIP Gourmet', deposit: 1.00, paidViaBukeaPay: true, specialRequest: 'Menú degustación previa' },
      { id: 'res-5', guestName: 'Valentina Rossi', phone: '+58 416 3322114', pax: 2, date: 'Hoy', time: '20:30', tableOrSlot: 'M-04 (Terraza)', status: 'confirmada', userTier: 'Explorador', deposit: 1.00, paidViaBukeaPay: true },
    ],
    waitlist: [
      { id: 'w-1', guestName: 'Alejandro Bastidas', phone: '+58 412 7776655', pax: 4, zoneRequested: 'Camas Balinesas', waitMinutes: 18, status: 'esperando' },
      { id: 'w-2', guestName: 'Carla Zambrano', phone: '+58 414 8889900', pax: 2, zoneRequested: 'Terraza Marina', waitMinutes: 8, status: 'esperando' },
    ],
    dishes: [
      {
        id: 'd-1',
        name: 'Langosta al Fuego de Leña',
        category: 'Del mar',
        priceUSD: 38,
        desc: 'Langosta fresca con mantequilla noisette, ajo negro y sal marina de Araya.',
        photo: 'https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Langosta fresca', 'Mantequilla noisette', 'Ajo negro', 'Sal de Araya'],
        isAvailable: true,
        badge: 'Especialidad',
      },
      {
        id: 'd-2',
        name: 'Ceviche Mixto Insular',
        category: 'Entradas',
        priceUSD: 16,
        desc: 'Pesca del día, pulpo tierno, ají dulce margariteño y leche de tigre al maracuyá.',
        photo: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Mero', 'Pulpo baby', 'Ají dulce', 'Cebolla morada', 'Maíz chulpe'],
        isAvailable: true,
      },
      {
        id: 'd-3',
        name: 'Tomahawk Steak Angus 800g',
        category: 'Parrilla',
        priceUSD: 52,
        desc: 'Corte premium madurado 28 días, sellado a la brasa con chimichurri rústico.',
        photo: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Angus 800g', 'Chimichurri rústico', 'Papas al romero'],
        isAvailable: true,
        badge: 'Corte Premium',
      },
      {
        id: 'd-4',
        name: 'Risotto de Mariscos & Azafrán',
        category: 'Del mar',
        priceUSD: 22,
        desc: 'Arroz arborio cremoso con calamares, camarones y mejillones de Pampatar.',
        photo: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Arroz arborio', 'Camarones', 'Mejillones', 'Bisque'],
        isAvailable: true,
      },
      {
        id: 'd-5',
        name: 'Tarta Tibia de Chocolate & Ron Carúpano',
        category: 'Postres',
        priceUSD: 10,
        desc: 'Cacao venezolano 70%, centro fundente y helado artesanal de vainilla bourbon.',
        photo: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Cacao San José 70%', 'Ron Carúpano Reserva', 'Helado de Vainilla'],
        isAvailable: true,
      },
    ],
  },
  'fitness-arena-gym': {
    id: 'fitness-arena-gym',
    name: 'Fitness Arena & Wellness',
    slug: 'fitness-arena-gym',
    category: 'Gym',
    cuisineOrSpecialty: 'Centro de Alto Rendimiento & Spa',
    spaceType: 'capacidad',
    description: 'Centro de acondicionamiento físico de élite, zona de recuperación crioterapéutica y clases personalizadas frente al mar.',
    address: 'Av. Aldonza Manrique, Playa El Ángel, Pampatar',
    zone: 'Playa El Ángel',
    phone: '+58 295 267 9900',
    whatsapp: '+58 412 300 4040',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
    heroImage: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    ],
    schedule: [
      { days: 'Lunes a Viernes', hours: '06:00 AM - 10:00 PM' },
      { days: 'Sábados y Domingos', hours: '08:00 AM - 06:00 PM' },
    ],
    toleranceMinutes: 10,
    pacingMaxGuestsPer15Min: 20,
    tableTurnaroundMinutes: 60,
    isReservationsPaused: false,
    totalCapacity: 50,
    bukeaPointsDebtUSD: 120.00,
    aiSettings: {
      whatsappAutoReply: true,
      reviewsAutoReply: false,
      reviewsTone: 'calido',
      onlyPositiveReviewsAutoReply: true,
    },
    tables: [],
    capacitySlots: [
      { time: '07:00 AM - 08:30 AM', reserved: 38, capacity: 50, label: 'Turno Mañana Prime' },
      { time: '08:30 AM - 10:00 AM', reserved: 45, capacity: 50, label: 'Spinning & HIIT' },
      { time: '10:00 AM - 12:00 PM', reserved: 22, capacity: 50, label: 'Horario Valle' },
      { time: '04:00 PM - 05:30 PM', reserved: 35, capacity: 50, label: 'Cross-Training' },
      { time: '05:30 PM - 07:00 PM', reserved: 49, capacity: 50, label: 'Pico Tarde' },
      { time: '07:00 PM - 08:30 PM', reserved: 41, capacity: 50, label: 'Musculación & Sauna' },
    ],
    reservations: [
      { id: 'res-g1', guestName: 'Alejandra Briceño', phone: '+58 412 1112233', pax: 1, date: 'Hoy', time: '08:30 AM', tableOrSlot: 'Spinning & HIIT', status: 'sentada', userTier: 'VIP Gourmet', deposit: 1.00, paidViaBukeaPay: true },
      { id: 'res-g2', guestName: 'Mariana Duque', phone: '+58 414 4445566', pax: 1, date: 'Hoy', time: '05:30 PM', tableOrSlot: 'Pico Tarde', status: 'confirmada', userTier: 'Prime', deposit: 1.00, paidViaBukeaPay: true },
      { id: 'res-g3', guestName: 'Gustavo Medina', phone: '+58 424 7778899', pax: 2, date: 'Hoy', time: '07:00 PM', tableOrSlot: 'Musculación & Sauna', status: 'confirmada', userTier: 'Foodie', deposit: 1.00, paidViaBukeaPay: true },
    ],
    waitlist: [
      { id: 'wg-1', guestName: 'Daniel Soto', phone: '+58 412 9990011', pax: 1, zoneRequested: 'Pico Tarde 05:30 PM', waitMinutes: 12, status: 'esperando' },
    ],
    dishes: [
      {
        id: 'ser-1',
        name: 'Pase Day Pass All-Inclusive + Recovery',
        category: 'Pases & Membresías',
        priceUSD: 18,
        desc: 'Acceso total a sala de pesas, cardio, sauna seco y 1 sesión de crioterapia.',
        photo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Sala de musculación', 'Zona cardio', 'Sauna nórdico', 'Crioterapia 15 min'],
        isAvailable: true,
        badge: 'Más Vendido',
      },
      {
        id: 'ser-2',
        name: 'Sesión Crioterapia & Masaje Deportivo',
        category: 'Bienestar & Spa',
        priceUSD: 35,
        desc: 'Recuperación muscular profunda asistida por fisioterapeuta certificado.',
        photo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
        ingredients: ['Baño de hielo guiado', 'Masaje de descarga 45 min'],
        isAvailable: true,
      },
    ],
  },
};
