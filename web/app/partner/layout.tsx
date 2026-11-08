'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sliders,
  UtensilsCrossed,
  Coins,
  Users,
  MessageSquare,
  Ticket,
  Star,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  ChevronDown,
  Building2,
  AlertCircle,
  Menu,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { PartnerProvider, usePartner } from './PartnerContext';
import { useBcv } from '@/app/context/BcvContext';

const NAV_ITEMS = [
  { href: '/partner', label: 'Gestión del Lugar', icon: LayoutDashboard },
  { href: '/partner/preferencias', label: 'Admin & Preferencias', icon: Sliders },
  { href: '/partner/pos', label: 'POS & Cocina (KDS)', icon: UtensilsCrossed },
  { href: '/partner/finanzas', label: 'Finanzas & Bukea-Pay', icon: Coins },
  { href: '/partner/crm', label: 'CRM & Fidelización', icon: Users },
  { href: '/partner/whatsapp', label: 'WhatsApp Chatbot', icon: MessageSquare },
  { href: '/partner/cupones', label: 'Cupones & Yield', icon: Ticket },
  { href: '/partner/reputacion', label: 'Reseñas & Reputación', icon: Star },
];

function PartnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { bcvRate } = useBcv();
  const {
    business,
    activeBusinessId,
    setActiveBusinessId,
    toggleReservationsPause,
    addManualReservation,
  } = usePartner();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState('1 hora');

  // Formulario de Reserva Manual (Walk-in)
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInPax, setWalkInPax] = useState(2);
  const [walkInTable, setWalkInTable] = useState('');
  const [walkInNotes, setWalkInNotes] = useState('');

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    addManualReservation({
      guestName: walkInName.trim(),
      phone: walkInPhone.trim() || 'Presencial / Sin teléfono',
      pax: Number(walkInPax),
      date: 'Hoy',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tableOrSlot: walkInTable || (business.spaceType === 'mesas' ? 'M-01' : 'Pase General'),
      status: 'sentada',
      userTier: 'Explorador',
      deposit: 0,
      specialRequest: walkInNotes.trim() || undefined,
    });

    setWalkInName('');
    setWalkInPhone('');
    setWalkInPax(2);
    setWalkInTable('');
    setWalkInNotes('');
    setShowWalkInModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#0A0A0A] flex flex-col md:flex-row antialiased">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200/80 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo Bukea Partner */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-logo text-2xl tracking-tight text-neutral-900">Bukea</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                  Partner
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium tracking-tight mt-0.5">
                Portal de Negocios Aliados
              </p>
            </div>
          </div>

          {/* Selector de Negocio */}
          <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60">
            <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
              Establecimiento Activo
            </label>
            <div className="relative">
              <select
                value={activeBusinessId}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 bg-transparent pr-7 py-1 focus:outline-none cursor-pointer appearance-none truncate"
              >
                <option value="downtown-beach-club">Downtown Beach Club (Mesas)</option>
                <option value="fitness-arena-gym">Fitness Arena & Wellness (Aforo)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-1 top-1.5 pointer-events-none" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 pt-1.5 border-t border-neutral-200/50">
              <span className="capitalize text-neutral-600 font-medium">
                {business.category}
              </span>
              <span className="font-semibold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200/60 text-[10px]">
                {business.spaceType === 'mesas' ? 'Modo Mesas' : 'Modo Capacidad'}
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-sm font-semibold'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar: Saldo Puntos Bukea */}
        <div className="pt-4 border-t border-neutral-100">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
              <span>Puntos Bukea por Cobrar</span>
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
            </div>
            <p className="text-base font-bold text-neutral-950">
              ${business.bukeaPointsDebtUSD.toFixed(2)}{' '}
              <span className="text-[10px] text-neutral-400 font-normal">USD</span>
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Reembolsable semanalmente por Bukea
            </p>
          </div>
        </div>
      </aside>

      {/* HEADER SUPERIOR & CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-neutral-900 tracking-tight">
                  {business.name}
                </h1>
                {/* Badge Status Online */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                    business.isReservationsPaused
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      business.isReservationsPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span>{business.isReservationsPaused ? 'Reservas Pausadas' : 'Online'}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                {business.cuisineOrSpecialty} · {business.zone}
              </p>
            </div>
          </div>

          {/* ACCIONES CRÍTICAS (BCV, KILL SWITCH & WALK-IN) */}
          <div className="flex items-center gap-2">
            {/* Tasa Oficial BCV */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs">
              <Coins className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-neutral-500">BCV:</span>
              <span className="font-bold text-neutral-900 font-mono">Bs. {bcvRate.toFixed(2)}</span>
            </div>

            {/* Kill Switch Toggle */}
            <button
              onClick={() => setShowPauseModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                business.isReservationsPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200/90'
              }`}
            >
              {business.isReservationsPaused ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reanudar Reservas</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Pausar Reservas</span>
                </>
              )}
            </button>

            {/* Reserva Manual / Walk-in */}
            <button
              onClick={() => setShowWalkInModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Reserva Manual</span>
            </button>
          </div>
        </header>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                Cambiar Establecimiento
              </label>
              <select
                value={activeBusinessId}
                onChange={(e) => {
                  setActiveBusinessId(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-semibold bg-transparent"
              >
                <option value="downtown-beach-club">Downtown Beach Club (Mesas)</option>
                <option value="fitness-arena-gym">Fitness Arena & Wellness (Aforo)</option>
              </select>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-neutral-950 text-white font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* MODAL KILL-SWITCH (PAUSAR RESERVAS) */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {business.isReservationsPaused ? 'Reanudar Reservas Online' : 'Pausar Reservas Online'}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {business.isReservationsPaused
                    ? 'Los clientes podrán volver a reservar mesas o cupos a través de Bukea de inmediato.'
                    : 'Detiene temporalmente el flujo de nuevas reservas para evitar sobrecarga en cocina o salón.'}
                </p>
              </div>
            </div>

            {!business.isReservationsPaused && (
              <div className="mt-5 space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Duración de la pausa:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1 hora', 'Por hoy', 'Indefinido'].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setPauseDuration(dur)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        pauseDuration === dur
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleReservationsPause(!business.isReservationsPaused, pauseDuration);
                  setShowPauseModal(false);
                }}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                  business.isReservationsPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {business.isReservationsPaused ? 'Confirmar y Reanudar' : 'Activar Pausa de Reservas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESERVA MANUAL (WALK-IN) */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Reserva Manual / Walk-in</h3>
                <p className="text-xs text-neutral-400">Registrar cliente presencial o telefónico</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Nombre del Titular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Gómez"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="0412 1234567"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Personas (Pax) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={walkInPax}
                    onChange={(e) => setWalkInPax(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  {business.spaceType === 'mesas' ? 'Mesa / Ubicación' : 'Turno / Área'}
                </label>
                {business.spaceType === 'mesas' ? (
                  <select
                    value={walkInTable}
                    onChange={(e) => setWalkInTable(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="">Asignación Automática</option>
                    {business.tables.map((tbl) => (
                      <option key={tbl.id} value={`${tbl.number} (${tbl.zone})`}>
                        {tbl.number} — {tbl.zone} (Cap. {tbl.capacity} pax) - [{tbl.status}]
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. Acceso Pase Diario / Clase 05:30 PM"
                    value={walkInTable}
                    onChange={(e) => setWalkInTable(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Notas / Requerimiento Especial
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cumpleaños, mesa con vista, alérgico a mariscos"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-neutral-900 hover:bg-black text-white rounded-xl shadow-sm"
                >
                  Confirmar y Sentar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PartnerProvider>
      <PartnerShell>{children}</PartnerShell>
    </PartnerProvider>
  );
}
