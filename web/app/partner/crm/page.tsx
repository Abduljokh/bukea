'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Crown,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  Gift,
  Heart,
  DollarSign,
  Award,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';

interface GuestProfile {
  id: string;
  name: string;
  phone: string;
  tier: 'Explorador' | 'Foodie' | 'VIP Gourmet' | 'Prime';
  totalSpentUSD: number;
  visitsCount: number;
  lastVisit: string;
  noShowRiskScore: number; // 0 a 100 (más alto = menor riesgo / mayor confiabilidad)
  preferredTable: string;
  dietaryRestrictions: string[];
  favoriteDish: string;
  vipCourtesyClaimed: boolean;
  notes: string;
}

const MOCK_GUESTS: GuestProfile[] = [
  {
    id: 'g-1',
    name: 'Carlos Mendoza',
    phone: '+58 412 1234567',
    tier: 'Prime',
    totalSpentUSD: 420.00,
    visitsCount: 8,
    lastVisit: 'Hoy',
    noShowRiskScore: 98,
    preferredTable: 'Terraza Marina M-01',
    dietaryRestrictions: ['Sin mariscos crudos'],
    favoriteDish: 'Tomahawk Steak Angus',
    vipCourtesyClaimed: true,
    notes: 'Le gusta mesa con sombra y vista despejada al atardecer.',
  },
  {
    id: 'g-2',
    name: 'Sofía Valero',
    phone: '+58 414 9900112',
    tier: 'VIP Gourmet',
    totalSpentUSD: 680.00,
    visitsCount: 12,
    lastVisit: 'Ayer',
    noShowRiskScore: 99,
    preferredTable: 'Cama Balinesa BAL-01',
    dietaryRestrictions: ['Celíaco / Sin gluten'],
    favoriteDish: 'Langosta al Fuego de Leña',
    vipCourtesyClaimed: false,
    notes: 'Cliente VIP histórica. Siempre solicita Moët Chandon bien frío.',
  },
  {
    id: 'g-3',
    name: 'Elena Rivas',
    phone: '+58 414 7654321',
    tier: 'Foodie',
    totalSpentUSD: 140.00,
    visitsCount: 3,
    lastVisit: 'Hace 5 días',
    noShowRiskScore: 88,
    preferredTable: 'Terraza Marina M-02',
    dietaryRestrictions: ['Alergia al maní'],
    favoriteDish: 'Ceviche Mixto Insular',
    vipCourtesyClaimed: false,
    notes: 'Suele venir en pareja los jueves.',
  },
  {
    id: 'g-4',
    name: 'Rodrigo Paez',
    phone: '+58 424 9988776',
    tier: 'Prime',
    totalSpentUSD: 310.00,
    visitsCount: 5,
    lastVisit: 'Hoy',
    noShowRiskScore: 94,
    preferredTable: 'Cama Balinesa BAL-02',
    dietaryRestrictions: [],
    favoriteDish: 'Risotto de Mariscos',
    vipCourtesyClaimed: true,
    notes: 'Amante de la música lounge, suele traer grupos de amigos.',
  },
  {
    id: 'g-5',
    name: 'Valentina Rossi',
    phone: '+58 416 3322114',
    tier: 'Explorador',
    totalSpentUSD: 45.00,
    visitsCount: 1,
    lastVisit: 'Primera visita hoy',
    noShowRiskScore: 72,
    preferredTable: 'Terraza',
    dietaryRestrictions: [],
    favoriteDish: 'Por definir',
    vipCourtesyClaimed: false,
    notes: 'Nuevo usuario registrado vía Bukea Escudo $1 USD.',
  },
];

export default function PartnerCRMPage() {
  const { business } = usePartner();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('Todos');
  const [activeGuest, setActiveGuest] = useState<GuestProfile | null>(MOCK_GUESTS[0]);

  const filteredGuests = MOCK_GUESTS.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.phone.includes(searchTerm);
    const matchesTier = selectedTier === 'Todos' || g.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HEADER CRM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              CRM Avanzado & Inteligencia de Clientes
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
              Predictive AI
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Algoritmo predictivo de asistencia (Scoring de No-Show), análisis de LTV y gestión de cortesías VIP.
          </p>
        </div>

        {/* MÉTRICAS RÁPIDAS LTV */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Ticket Medio</span>
            <span className="font-bold text-neutral-900">$54.20 USD</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">LTV Promedio</span>
            <span className="font-bold text-emerald-700">$318.00 USD</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LISTA DE COMENSALES Y FILTROS */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['Todos', 'Prime', 'VIP Gourmet', 'Foodie', 'Explorador'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTier === t
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredGuests.map((guest) => {
              const isSelected = activeGuest?.id === guest.id;
              return (
                <div
                  key={guest.id}
                  onClick={() => setActiveGuest(guest)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{guest.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : guest.tier === 'VIP Gourmet'
                          ? 'bg-amber-100 text-amber-900'
                          : guest.tier === 'Prime'
                          ? 'bg-neutral-950 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {guest.tier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className={isSelected ? 'text-neutral-300' : 'text-neutral-500'}>
                      {guest.visitsCount} visitas · LTV: ${guest.totalSpentUSD}
                    </span>
                    <span
                      className={`font-semibold ${
                        guest.noShowRiskScore >= 90
                          ? isSelected ? 'text-emerald-300' : 'text-emerald-700'
                          : isSelected ? 'text-amber-300' : 'text-amber-700'
                      }`}
                    >
                      {guest.noShowRiskScore}% fiabilidad
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETALLE Y FICHA 360° DEL CLIENTE SELECCIONADO */}
        {activeGuest && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
              {/* Header Ficha */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900">{activeGuest.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                      Nivel {activeGuest.tier}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">{activeGuest.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${activeGuest.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp VIP</span>
                  </a>
                </div>
              </div>

              {/* Grid de Inteligencia Predictiva & Métricas LTV */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Score de No-Show
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-neutral-900">
                      {activeGuest.noShowRiskScore}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">Riesgo Bajo</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Asistencia perfecta en sus últimas 8 reservas.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Gasto Acumulado (LTV)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-neutral-900">
                      ${activeGuest.totalSpentUSD.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">USD</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {activeGuest.visitsCount} visitas completadas
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Mesa Favorita
                  </span>
                  <div className="text-sm font-bold text-neutral-900 truncate">
                    {activeGuest.preferredTable}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Plato: {activeGuest.favoriteDish}
                  </p>
                </div>
              </div>

              {/* Cortesía de Bienvenida VIP */}
              {(activeGuest.tier === 'VIP Gourmet' || activeGuest.tier === 'Prime') && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Cortesía de Bienvenida VIP Aplicable
                      </h4>
                      <p className="text-[11px] text-amber-700">
                        Por estatus {activeGuest.tier}, tiene derecho a copa de espumante o postre de la casa al sentarse.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
                    {activeGuest.vipCourtesyClaimed ? 'Ya Entregada Hoy' : 'Pendiente por Servir'}
                  </span>
                </div>
              )}

              {/* Alergias y Restricciones */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-700 block">
                  Restricciones Alimentarias & Salud:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeGuest.dietaryRestrictions.length > 0 ? (
                    activeGuest.dietaryRestrictions.map((al, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold"
                      >
                        {al}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400">Sin restricciones reportadas.</span>
                  )}
                </div>
              </div>

              {/* Notas del Maître */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-1">
                <span className="text-xs font-bold text-neutral-800 block">
                  Notas Internas de Servicio (Privadas):
                </span>
                <p className="text-xs text-neutral-600">{activeGuest.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
