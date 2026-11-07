'use client';

import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Percent,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Lock,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';

interface CouponCampaign {
  id: string;
  title: string;
  discountPercent: number;
  daysActive: string;
  timeWindow: string;
  maxRedemptionsPerDay: number;
  currentRedemptions: number;
  requiresBukeaPay: boolean;
  isActive: boolean;
}

const INITIAL_COUPONS: CouponCampaign[] = [
  {
    id: 'c-1',
    title: 'Yield Valle: 20% OFF en Carta Completa',
    discountPercent: 20,
    daysActive: 'Lunes a Jueves',
    timeWindow: '12:00 PM - 05:00 PM',
    maxRedemptionsPerDay: 8,
    currentRedemptions: 3,
    requiresBukeaPay: true,
    isActive: true,
  },
  {
    id: 'c-2',
    title: 'Sunset 2x1 en Coctelería de Autor',
    discountPercent: 50,
    daysActive: 'Miércoles y Jueves',
    timeWindow: '05:00 PM - 07:30 PM',
    maxRedemptionsPerDay: 15,
    currentRedemptions: 9,
    requiresBukeaPay: true,
    isActive: true,
  },
  {
    id: 'c-3',
    title: 'Cena Gourmet 15% OFF para Foodies & VIPs',
    discountPercent: 15,
    daysActive: 'Lunes a Miércoles',
    timeWindow: '08:00 PM - 11:00 PM',
    maxRedemptionsPerDay: 5,
    currentRedemptions: 5,
    requiresBukeaPay: true,
    isActive: false,
  },
];

export default function PartnerCuponesPage() {
  const { business } = usePartner();
  const [coupons, setCoupons] = useState<CouponCampaign[]>(INITIAL_COUPONS);
  const [showModal, setShowModal] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDiscount, setFormDiscount] = useState(20);
  const [formDays, setFormDays] = useState('Lunes a Jueves (Días Valle)');
  const [formHours, setFormHours] = useState('12:00 PM - 05:00 PM');
  const [formMax, setFormMax] = useState(10);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: CouponCampaign = {
      id: `c-${Date.now()}`,
      title: formTitle,
      discountPercent: formDiscount,
      daysActive: formDays,
      timeWindow: formHours,
      maxRedemptionsPerDay: formMax,
      currentRedemptions: 0,
      requiresBukeaPay: true,
      isActive: true,
    };
    setCoupons([newCoupon, ...coupons]);
    setShowModal(false);
    setFormTitle('');
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HEADER CUPONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Cupones & Yield Management
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
              Cero Riesgo Financiero
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Llena mesas vacías de lunes a jueves con descuentos configurados y financiados 100% por tu establecimiento.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Promoción Valle</span>
        </button>
      </div>

      {/* BANNER REGLA DE ORO */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900">
            Candado Bukea-Pay Activo en Todas las Promociones
          </h4>
          <p className="text-[11px] text-amber-800 mt-0.5">
            El descuento o beneficio 2x1 solo se aplica si el comensal paga su cuenta a través de la pasarela Bukea-Pay (NFC o QR en mesa), garantizando el flujo formal por la plataforma.
          </p>
        </div>
      </div>

      {/* LISTA DE CAMPAÑAS ACTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-5 rounded-2xl border transition-all space-y-4 ${
              coupon.isActive
                ? 'bg-white border-neutral-200/80 shadow-xs'
                : 'bg-neutral-50 border-neutral-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl font-black text-neutral-950">
                  {coupon.discountPercent}% OFF
                </span>
                <h4 className="text-xs font-bold text-neutral-900 mt-1">{coupon.title}</h4>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  coupon.isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {coupon.isActive ? 'Activo' : 'Pausado'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>{coupon.daysActive}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{coupon.timeWindow}</span>
              </div>
            </div>

            {/* Progreso de Redenciones */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-neutral-600 mb-1">
                <span>Cupo diario de mesas con descuento:</span>
                <span>
                  {coupon.currentRedemptions} / {coupon.maxRedemptionsPerDay}
                </span>
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-neutral-900 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (coupon.currentRedemptions / coupon.maxRedemptionsPerDay) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => toggleCouponStatus(coupon.id)}
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-950"
              >
                {coupon.isActive ? 'Pausar' : 'Reactivar'}
              </button>
              <button
                onClick={() => deleteCoupon(coupon.id)}
                className="text-rose-600 hover:text-rose-700 p-1 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR CUPÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">Crear Promoción de Rendimiento</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configura descuentos para incentivar el consumo en horas de baja demanda.
            </p>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Título de la Promoción *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Almuerzo Ejecutivo 20% OFF Lun-Jue"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    % de Descuento
                  </label>
                  <select
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs bg-white"
                  >
                    <option value="15">15% OFF</option>
                    <option value="20">20% OFF</option>
                    <option value="25">25% OFF</option>
                    <option value="30">30% OFF</option>
                    <option value="50">50% (2x1)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Máx. Mesas / Día
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formMax}
                    onChange={(e) => setFormMax(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Días Aplicables
                </label>
                <input
                  type="text"
                  value={formDays}
                  onChange={(e) => setFormDays(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Horario Valle
                </label>
                <input
                  type="text"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl shadow-xs"
                >
                  Activar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
