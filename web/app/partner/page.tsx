'use client';

import React, { useState } from 'react';
import {
  Users,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  XCircle,
  HelpCircle,
  BellRing,
} from 'lucide-react';
import { usePartner } from './PartnerContext';
import { PartnerTable, TableStatus } from './data/partnerData';

export default function PartnerGestionPage() {
  const {
    business,
    updateTableStatus,
    updateReservationStatus,
    updateWaitlistStatus,
  } = usePartner();

  const [selectedZone, setSelectedZone] = useState<string>('Todas');
  const [selectedTable, setSelectedTable] = useState<PartnerTable | null>(null);
  const [reservationSearch, setReservationSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'hoy' | 'waitlist' | 'historial'>('hoy');

  // Cálculo de métricas
  const totalTables = business.tables.length;
  const occupiedTables = business.tables.filter((t) => t.status === 'ocupada').length;
  const reservedTables = business.tables.filter((t) => t.status === 'reservada').length;
  const freeTables = business.tables.filter((t) => t.status === 'libre').length;
  const billingTables = business.tables.filter((t) => t.status === 'cuenta_pedida').length;

  const occupancyRate =
    business.spaceType === 'mesas'
      ? totalTables > 0
        ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100)
        : 0
      : Math.round(
          (business.capacitySlots.reduce((acc, s) => acc + s.reserved, 0) /
            Math.max(
              1,
              business.capacitySlots.reduce((acc, s) => acc + s.capacity, 0)
            )) *
            100
        );

  // Zonas únicas para filtro
  const zones = ['Todas', ...Array.from(new Set(business.tables.map((t) => t.zone)))];

  const filteredTables =
    selectedZone === 'Todas'
      ? business.tables
      : business.tables.filter((t) => t.zone === selectedZone);

  const filteredReservations = business.reservations.filter((r) =>
    r.guestName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
    r.phone.includes(reservationSearch)
  );

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'libre':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Libre',
        };
      case 'reservada':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-800',
          dot: 'bg-amber-500',
          label: 'Reservada',
        };
      case 'ocupada':
        return {
          bg: 'bg-neutral-900',
          border: 'border-neutral-900',
          badge: 'bg-neutral-800 text-white',
          dot: 'bg-white',
          label: 'Ocupada',
        };
      case 'cuenta_pedida':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800',
          dot: 'bg-purple-500',
          label: 'Cuenta Pedida',
        };
      case 'bloqueada':
        return {
          bg: 'bg-neutral-100',
          border: 'border-neutral-300',
          badge: 'bg-neutral-200 text-neutral-600',
          dot: 'bg-neutral-400',
          label: 'Bloqueada',
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* 1. KPIs DEL SALÓN Y OPERACIÓN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ocupación */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ocupación Salón</span>
            <TrendingUp className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-950 font-text">
              {occupancyRate}%
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {business.spaceType === 'mesas'
                ? `${occupiedTables} de ${totalTables} mesas`
                : `${business.totalCapacity} cupos totales`}
            </span>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-neutral-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Próximas Reservas */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reservas Hoy</span>
            <Calendar className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-950 font-text">
              {business.reservations.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {business.reservations.filter((r) => r.status === 'confirmada' || r.status === 'en_camino').length} por llegar
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {business.reservations.reduce((acc, r) => acc + r.pax, 0)} comensales proyectados
          </p>
        </div>

        {/* KPI 3: Waitlist */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lista de Espera</span>
            <Clock className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-950 font-text">
              {business.waitlist.filter((w) => w.status === 'esperando').length}
            </span>
            <span className="text-xs text-neutral-400 font-medium">grupos en cola</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Tiempo prom. espera: 15 min</p>
        </div>

        {/* KPI 4: Liquidación Puntos Bukea */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Puntos Bukea</span>
            <Sparkles className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-neutral-950 font-text">
              ${business.bukeaPointsDebtUSD.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400 font-medium">USD por liquidar</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Financiado y garantizado por Bukea</p>
        </div>
      </div>

      {/* 2. NÚCLEO OPERATIVO: MESAS O CAPACIDAD */}
      <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                {business.spaceType === 'mesas' ? 'Distribución de Mesas en Salón' : 'Monitor de Aforo & Turnos'}
              </h2>
              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200/60">
                {business.spaceType === 'mesas' ? `${totalTables} Mesas Físicas` : 'Control de Cupos'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {business.spaceType === 'mesas'
                ? 'Haz clic en cualquier mesa para cambiar su estado o ver los datos del comensal sentado.'
                : 'Monitorea los cupos ocupados por turno y registra el check-in presencial.'}
            </p>
          </div>

          {/* Filtro de Zonas para Modo Mesas */}
          {business.spaceType === 'mesas' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedZone === zone
                      ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                      : 'bg-neutral-100/70 text-neutral-600 hover:bg-neutral-200/60'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LEYENDA DE ESTADOS */}
        {business.spaceType === 'mesas' && (
          <div className="flex flex-wrap items-center gap-4 py-3 border-b border-neutral-100 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">Estados:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Libre ({freeTables})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Reservada ({reservedTables})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
              <span>Ocupada ({occupiedTables})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Cuenta Pedida ({billingTables})</span>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL ESPACIO: CASO 1: MODO MESAS */}
        {business.spaceType === 'mesas' ? (
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredTables.map((tbl) => {
              const style = getStatusColor(tbl.status);
              const isDark = tbl.status === 'ocupada';

              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] shadow-xs flex flex-col justify-between min-h-[135px] ${style.bg} ${style.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {tbl.number}
                      </span>
                      <p className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'} truncate max-w-[90px]`}>
                        {tbl.zone}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${style.badge}`}>
                      {tbl.capacity}p
                    </span>
                  </div>

                  <div className="mt-3">
                    {tbl.currentGuest ? (
                      <div>
                        <p className={`text-xs font-semibold truncate ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                          {tbl.currentGuest.name}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'} flex items-center gap-1`}>
                          <Clock className="w-3 h-3" />
                          <span>{tbl.currentGuest.time}</span>
                          <span>· {tbl.currentGuest.pax} pax</span>
                        </p>
                      </div>
                    ) : (
                      <p className={`text-[11px] font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        Mesa disponible
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-black/5 mt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {style.label}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* CASO 2: MODO CAPACIDAD Y AFORO (GYM, HOTEL, SPA) */
          <div className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {business.capacitySlots.map((slot, idx) => {
                const percent = Math.round((slot.reserved / slot.capacity) * 100);
                const isFull = slot.reserved >= slot.capacity;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-neutral-900">{slot.time}</span>
                        {slot.label && (
                          <p className="text-[11px] text-neutral-500 font-medium">{slot.label}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-rose-100 text-rose-800'
                            : percent > 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFull ? 'Agotado' : `${slot.capacity - slot.reserved} cupos libres`}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-neutral-600">Aforo Reservado</span>
                        <span className="text-neutral-900">
                          {slot.reserved} / {slot.capacity} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : 'bg-neutral-900'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. PESTAÑAS INFERIORES: PANEL DE RESERVAS, WAITLIST E HISTORIAL */}
      <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            {[
              { id: 'hoy', label: 'Próximas Reservas', count: business.reservations.length },
              { id: 'waitlist', label: 'Waitlist Activa', count: business.waitlist.filter((w) => w.status === 'esperando').length },
              { id: 'historial', label: 'Historial', count: undefined },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.id ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por cliente o teléfono..."
              value={reservationSearch}
              onChange={(e) => setReservationSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
            />
          </div>
        </div>

        {/* TAB 1: PRÓXIMAS RESERVAS HOY */}
        {activeTab === 'hoy' && (
          <div className="pt-4 overflow-x-auto">
            {filteredReservations.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                No se encontraron reservas registradas para hoy.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Hora</th>
                    <th className="py-3 px-3">Titular & Nivel</th>
                    <th className="py-3 px-3">Pax</th>
                    <th className="py-3 px-3">Ubicación / Slot</th>
                    <th className="py-3 px-3">Escudo / Pago</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredReservations.map((res) => {
                    return (
                      <tr key={res.id} className="hover:bg-neutral-50/70 transition-all">
                        <td className="py-3 px-3 font-bold text-neutral-900 whitespace-nowrap">
                          {res.time}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900">{res.guestName}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                            <span>{res.phone}</span>
                            <span>·</span>
                            <span className="font-semibold text-neutral-700 bg-neutral-100 px-1.5 py-0.2 rounded text-[10px]">
                              {res.userTier}
                            </span>
                          </div>
                          {res.specialRequest && (
                            <p className="text-[10px] text-amber-600 mt-0.5 italic">
                              Nota: {res.specialRequest}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-700">
                          {res.pax} pax
                        </td>
                        <td className="py-3 px-3 text-neutral-600 font-medium">
                          {res.tableOrSlot}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>${res.deposit.toFixed(2)} USD</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={res.status}
                            onChange={(e) => updateReservationStatus(res.id, e.target.value as any)}
                            className="text-xs font-semibold py-1 px-2 rounded-lg border border-neutral-200 bg-white focus:outline-none cursor-pointer"
                          >
                            <option value="confirmada">Confirmada</option>
                            <option value="en_camino">En Camino</option>
                            <option value="sentada">Sentada en Mesa</option>
                            <option value="completada">Completada</option>
                            <option value="no_show">No-Show</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(res.guestName)},%20te%20escribimos%20de%20${encodeURIComponent(business.name)}%20respecto%20a%20tu%20reserva%20de%20hoy.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                              title="Escribir por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => updateReservationStatus(res.id, 'sentada')}
                              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold transition-all"
                            >
                              Sentar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: WAITLIST ACTIVA */}
        {activeTab === 'waitlist' && (
          <div className="pt-4 space-y-3">
            {business.waitlist.filter((w) => w.status === 'esperando').length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                No hay clientes esperando mesa en este momento.
              </div>
            ) : (
              business.waitlist
                .filter((w) => w.status === 'esperando')
                .map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">{w.guestName}</span>
                        <span className="text-xs text-neutral-500">({w.pax} personas)</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {w.zoneRequested}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>En espera desde hace {w.waitMinutes} minutos</span>
                        <span>·</span>
                        <span>{w.phone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${w.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(w.guestName)},%20¡tu%20mesa%20en%20${encodeURIComponent(business.name)}%20está%20lista!%20Por%20favor%20acércate%20a%20recepción.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Notificar Mesa Lista</span>
                      </a>
                      <button
                        onClick={() => updateWaitlistStatus(w.id, 'sentado')}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold"
                      >
                        Marcar Sentado
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* TAB 3: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="pt-4 text-center py-8">
            <p className="text-xs text-neutral-500">
              Mostrando las últimas reservas completadas del mes en {business.name}.
            </p>
            <div className="mt-4 inline-block text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-xl">
              142 comensales atendidos este mes con 98.4% de tasa de asistencia
            </div>
          </div>
        )}
      </section>

      {/* MODAL DETALLE DE MESA SELECCIONADA */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Mesa {selectedTable.number}
                </h3>
                <p className="text-xs text-neutral-400">
                  {selectedTable.zone} · Capacidad: {selectedTable.capacity} pax
                </p>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {selectedTable.currentGuest ? (
              <div className="my-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Comensal Asignado
                </span>
                <p className="text-sm font-bold text-neutral-900">
                  {selectedTable.currentGuest.name}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedTable.currentGuest.pax} comensales · Sentado a las{' '}
                  {selectedTable.currentGuest.time}
                </p>
                {selectedTable.currentGuest.notes && (
                  <p className="text-xs text-amber-700 mt-1 italic">
                    Nota: {selectedTable.currentGuest.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 my-4">
                Esta mesa se encuentra actualmente disponible para asignar a un comensal.
              </p>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 block">
                Cambiar Estado de Mesa:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'libre', label: 'Libre' },
                  { id: 'ocupada', label: 'Ocupada' },
                  { id: 'cuenta_pedida', label: 'Cuenta Pedida' },
                  { id: 'bloqueada', label: 'Bloquear' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      updateTableStatus(selectedTable.id, st.id as any);
                      setSelectedTable(null);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      selectedTable.status === st.id
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setSelectedTable(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
