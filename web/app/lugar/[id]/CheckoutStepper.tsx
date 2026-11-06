'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Clock, 
  User, 
  Phone, 
  Check, 
  CheckCircle2, 
  CreditCard, 
  Coins, 
  Building2, 
  KeyRound, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileText,
  Sparkles,
  Heart,
  Baby,
  Gift,
  Utensils
} from 'lucide-react';
import { Business, StoredReservation } from '@/app/data/businesses';

interface CheckoutStepperProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  date: string;
  slot: { start: string; end: string } | null;
  size: number;
  onSuccess: (code: string, guestData: { name: string; phone: string; notes: string }) => void;
}

const BANCOS_VE = [
  { code: '0134', name: 'Banesco Banco Universal' },
  { code: '0102', name: 'Banco de Venezuela (BDV)' },
  { code: '0105', name: 'Banco Mercantil' },
  { code: '0108', name: 'BBVA Provincial' },
  { code: '0172', name: 'Bancamiga' },
  { code: '0191', name: 'Banco Nacional de Crédito (BNC)' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0174', name: 'Banplus Banco Universal' },
  { code: '0115', name: 'Banco Exterior' },
  { code: '0151', name: 'Banco Fondo Común (BFC)' },
];

export default function CheckoutStepper({
  isOpen,
  onClose,
  business,
  date,
  slot,
  size,
  onSuccess,
}: CheckoutStepperProps) {
  // Stepper Accordion state (1, 2, or 3)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Countdown timer: 5 minutes (300 seconds)
  const [timeLeft, setTimeLeft] = useState(250); // 04:10 inicial para coincidir con la referencia

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // PASO 1: Datos de Contacto Directo
  const [fullName, setFullName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+58');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const quickPills = [
    { label: 'Aniversario', icon: Gift },
    { label: 'Silla de bebé', icon: Baby },
    { label: 'Mesa romántica', icon: Heart },
    { label: 'Menú Celíaco', icon: Utensils },
  ];

  const handleAddPill = (pillText: string) => {
    if (!specialRequest) {
      setSpecialRequest(pillText);
    } else if (!specialRequest.includes(pillText)) {
      setSpecialRequest(`${specialRequest}, ${pillText}`);
    }
  };

  // PASO 2: Escudo Anti-Spam
  const [guaranteeType, setGuaranteeType] = useState<'abono' | 'puntos'>('abono');
  const [paymentMethod, setPaymentMethod] = useState<'c2p' | 'pagomovil'>('c2p');

  // PASO 3: Datos de Pago
  const [selectedBank, setSelectedBank] = useState('0134');
  const [cedulaType, setCedulaType] = useState('V-');
  const [cedulaNumber, setCedulaNumber] = useState('');
  const [affiliatedPhone, setAffiliatedPhone] = useState('');
  const [c2pToken, setC2pToken] = useState('');
  const [pmReference, setPmReference] = useState('');
  const [requestedToken, setRequestedToken] = useState(false);

  // Estado de procesamiento
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState('');

  if (!isOpen) return null;

  // Validación y cambio de paso
  const handleProceedToStep2 = () => {
    setStepError('');
    if (!fullName.trim() || fullName.trim().length < 3) {
      setStepError('Por favor ingresa tu nombre y apellido completo.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      setStepError('Por favor ingresa un número de WhatsApp válido.');
      return;
    }
    setActiveStep(2);
  };

  const handleProceedToStep3 = () => {
    setStepError('');
    setActiveStep(3);
  };

  // Finalizar y garantizar reserva
  const handleConfirmReservation = async () => {
    setStepError('');
    if (!fullName.trim()) {
      setActiveStep(1);
      setStepError('Completa tu nombre en el Paso 1.');
      return;
    }
    if (!phoneNumber.trim()) {
      setActiveStep(1);
      setStepError('Completa tu WhatsApp en el Paso 1.');
      return;
    }

    if (guaranteeType === 'abono') {
      if (!cedulaNumber.trim()) {
        setActiveStep(3);
        setStepError('Por favor ingresa tu número de cédula.');
        return;
      }
      if (paymentMethod === 'c2p' && !c2pToken.trim()) {
        setActiveStep(3);
        setStepError('Por favor ingresa el token OTP SMS recibido de tu banco.');
        return;
      }
      if (paymentMethod === 'pagomovil' && !pmReference.trim()) {
        setActiveStep(3);
        setStepError('Por favor ingresa el número de referencia del Pago Móvil.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Simulación de aprobación de Débito Inmediato C2P / Verificación Anti-Spam
      await new Promise((r) => setTimeout(r, 1200));

      const code = `BK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      onSuccess(code, {
        name: fullName.trim(),
        phone: `${phoneCode} ${phoneNumber.trim()}`,
        notes: specialRequest.trim(),
      });
    } catch {
      setStepError('Ocurrió un error procesando la verificación. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  // Formateador de hora legible
  const fmtTime = (iso?: string) => {
    if (!iso) return '8:30 PM';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '8:30 PM';
    }
  };

  // Formateador de fecha legible
  const fmtDate = (dStr: string) => {
    try {
      const [y, m, d] = dStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      return dateObj.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl bg-[#FAFAFA] border border-black/10 shadow-2xl flex flex-col overflow-hidden text-[#0A0A0A] font-text my-auto">
        
        {/* TOPBAR CO-BRANDED CON ESTILO MARGARITA VIP */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center transition-colors text-black"
              aria-label="Volver"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-logo text-2xl text-black leading-none pt-0.5">Bukea</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                Margarita VIP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold flex items-center gap-1 tracking-tight">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>SHIELD OK</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center text-xs font-bold text-neutral-700">
              <User size={14} />
            </div>
          </div>
        </header>

        {/* BANNER SUBHEADER: CHECKOUT RÁPIDO Y CRONÓMETRO DE RETENCIÓN DE MESA */}
        <div className="bg-amber-50/90 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>PASO 2 DE 2 · CHECKOUT RÁPIDO</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-950 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300/40">
            <Clock size={12} className="text-amber-700" />
            <span>Mesa retenida: {formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: ACORDION STEPPER */}
        <div className="p-4 sm:p-5 space-y-3.5 flex-1 overflow-y-auto">

          {/* TARJETA RESUMEN DEL LUGAR / MESA SELECCIONADA */}
          <div className="p-3.5 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center gap-3">
            <img
              src={business.heroImage}
              alt={business.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-black/5"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm text-black truncate font-text">{business.name}</h2>
              <div className="text-[11px] font-semibold text-neutral-600 mt-0.5 uppercase tracking-wide">
                {fmtDate(date)}, {fmtTime(slot?.start)} · TERRAZA VIP ({size} PAX)
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                <Lock size={10} className="text-emerald-600" />
                <span>Cupo verificado por Bukea Direct</span>
              </div>
            </div>
          </div>

          {/* MENSAJE DE ERROR GLOBAL */}
          {stepError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-600" />
              <span>{stepError}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* PASO 1: DATOS DE CONTACTO DIRECTO                            */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 1 ? (fullName ? 2 : 1) : 1)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  fullName && phoneNumber ? 'bg-emerald-500 text-white' : 'bg-black text-white'
                }`}>
                  {fullName && phoneNumber ? <Check size={14} /> : '1'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-black">
                      ⚡ DATOS DE CONTACTO DIRECTO
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                      SIN CONTRASEÑA
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Tu mesa queda confirmada y enviada a tu WhatsApp al instante.
                  </div>
                </div>
              </div>
              <div>
                {activeStep === 1 ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
              </div>
            </button>

            {activeStep === 1 && (
              <div className="px-4 pb-4 pt-1 border-t border-black/5 space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                    NOMBRE Y APELLIDO
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Ej. Carlos Mendoza"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-minimal text-xs pl-10 pr-10 bg-neutral-50/60 focus:bg-white"
                    />
                    {fullName.length >= 3 && (
                      <CheckCircle2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                    WHATSAPP DE CONFIRMACIÓN
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-28 shrink-0">
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="input-minimal text-xs pr-7 font-medium bg-neutral-50/60 focus:bg-white appearance-none cursor-pointer"
                      >
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+52">🇲🇽 +52</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="tel"
                        placeholder="412 1234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-minimal text-xs pl-9 bg-neutral-50/60 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                      ¿REQUERIMIENTO ESPECIAL?
                    </label>
                    <span className="text-[10px] text-neutral-400 font-mono">OPCIONAL</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ej. Cumpleaños, ubicación cerca a la piscina…"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    className="input-minimal text-xs bg-neutral-50/60 focus:bg-white"
                  />
                  {/* Quick Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {quickPills.map((pill, idx) => {
                      const Icon = pill.icon;
                      const isSelected = specialRequest.includes(pill.label);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPill(pill.label)}
                          className={`text-[11px] py-1 px-2.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-black text-white border-black font-semibold'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-black/10'
                          }`}
                        >
                          <Icon size={12} className={isSelected ? 'text-white' : 'text-neutral-500'} />
                          <span>{pill.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="btn-solid w-full py-2.5 text-xs font-bold justify-center cursor-pointer mt-2"
                >
                  Continuar al Paso 2
                </button>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* PASO 2: ESCUDO ANTI-SPAM                                     */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setActiveStep(activeStep === 2 ? 3 : 2)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep > 2 ? 'bg-emerald-500 text-white' : 'bg-black text-white'
                }`}>
                  {activeStep > 2 ? <Check size={14} /> : '2'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-black flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>ESCUDO ANTI-SPAM</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold">
                      CERO BOTS
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Protección activa de cupos y reservas garantizadas.
                  </div>
                </div>
              </div>
              <div>
                {activeStep === 2 ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
              </div>
            </button>

            {activeStep === 2 && (
              <div className="px-4 pb-4 pt-1 border-t border-black/5 space-y-3.5">
                {/* SELECTOR: ABONO $1 USD vs PUNTOS BUKEA */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setGuaranteeType('abono')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      guaranteeType === 'abono'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>ABONO $1 USD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuaranteeType('puntos')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      guaranteeType === 'puntos'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <Coins size={14} className="text-amber-500" />
                    <span>PUNTOS BUKEA (40)</span>
                  </button>
                </div>

                {/* CALLOUT: GARANTÍA 100% CONSUMIBLE */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sparkles size={13} className="text-amber-600 shrink-0" />
                    <span>Garantía 100% Consumible</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Abona tu primer consumo de <strong className="text-amber-950 font-bold">$1.00 USD (Bs. 36.50 tasa BCV)</strong> para verificar tu identidad. Se descontará en su totalidad de tu cuenta final en el restaurante.
                  </p>
                </div>

                {/* BOTONES PARA ELEGIR ENTRE C2P O PAGO MÓVIL */}
                {guaranteeType === 'abono' && (
                  <div>
                    <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                      MÉTODO DE GARANTÍA INSTANTÁNEA
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('c2p')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'c2p'
                            ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-600'
                        }`}
                      >
                        <Zap size={14} className={paymentMethod === 'c2p' ? 'text-amber-500' : 'text-neutral-400'} />
                        <span>C2P AUTOMÁTICO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pagomovil')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'pagomovil'
                            ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-600'
                        }`}
                      >
                        <FileText size={14} className={paymentMethod === 'pagomovil' ? 'text-emerald-600' : 'text-neutral-400'} />
                        <span>PAGO MÓVIL DIRECTO</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mt-2 px-1">
                      <span>{paymentMethod === 'c2p' ? 'DÉBITO INMEDIATO C2P' : 'VALIDACIÓN DE REFERENCIA'}</span>
                      <span className="text-emerald-700 font-bold">⚡ APROBACIÓN EN 5 SEG</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className="btn-solid w-full py-2.5 text-xs font-bold justify-center cursor-pointer mt-1"
                >
                  Continuar al Paso 3
                </button>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* PASO 3: SELECCIÓN DE BANCO Y DATOS                           */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-black">
                      {paymentMethod === 'c2p' ? 'VERIFICACIÓN BANCARIA C2P' : 'DATOS DE PAGO MÓVIL'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-black/10 text-[9px] font-bold">
                      {guaranteeType === 'puntos' ? '40 PUNTOS' : 'BS. 36.50'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {paymentMethod === 'c2p' ? 'Débito bancario sin salir de Bukea.' : 'Ingresa la referencia de tu pago.'}
                  </div>
                </div>
              </div>
              <div>
                {activeStep === 3 ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
              </div>
            </button>

            {activeStep === 3 && (
              <div className="px-4 pb-4 pt-1 border-t border-black/5 space-y-3.5">
                {guaranteeType === 'puntos' ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
                    <Coins size={28} className="mx-auto text-amber-500" />
                    <div className="font-bold text-xs text-amber-950">Canje de Garantía con Puntos Bukea</div>
                    <p className="text-[11px] text-amber-800 max-w-xs mx-auto">
                      Se debitarán 40 Puntos de tu Bukea Pass para blindar esta mesa sin necesidad de pago bancario.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* BANCO EMISOR */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                        BANCO EMISOR
                      </label>
                      <div className="relative">
                        <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="input-minimal text-xs pl-10 pr-8 bg-neutral-50/60 focus:bg-white appearance-none cursor-pointer font-medium"
                        >
                          {BANCOS_VE.map((b) => (
                            <option key={b.code} value={b.code}>
                              {b.name} ({b.code})
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* CÉDULA Y TELÉFONO EN GRID DE 2 COLS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                          CÉDULA TITULAR
                        </label>
                        <div className="flex gap-1.5">
                          <select
                            value={cedulaType}
                            onChange={(e) => setCedulaType(e.target.value)}
                            className="input-minimal text-xs w-16 shrink-0 bg-neutral-50/60 font-medium px-2"
                          >
                            <option value="V-">V-</option>
                            <option value="E-">E-</option>
                            <option value="J-">J-</option>
                          </select>
                          <input
                            type="text"
                            placeholder="18492011"
                            value={cedulaNumber}
                            onChange={(e) => setCedulaNumber(e.target.value)}
                            className="input-minimal text-xs flex-1 bg-neutral-50/60 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                          TELÉFONO AFILIADO
                        </label>
                        <input
                          type="tel"
                          placeholder="0412 1234567"
                          value={affiliatedPhone}
                          onChange={(e) => setAffiliatedPhone(e.target.value)}
                          className="input-minimal text-xs bg-neutral-50/60 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* TOKEN C2P vs REFERENCIA PAGO MÓVIL */}
                    {paymentMethod === 'c2p' ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                            TOKEN BANCARIO DINÁMICO (OTP SMS)
                          </label>
                          <button
                            type="button"
                            onClick={() => setRequestedToken(true)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider cursor-pointer"
                          >
                            {requestedToken ? '✓ CLAVE ENVIADA' : 'SOLICITAR CLAVE'}
                          </button>
                        </div>
                        <div className="relative">
                          <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Ingresa clave SMS recibida (6-8 dígitos)"
                            value={c2pToken}
                            onChange={(e) => setC2pToken(e.target.value)}
                            className="input-minimal text-xs pl-10 pr-10 bg-neutral-50/60 focus:bg-white font-mono"
                          />
                          {c2pToken.length >= 6 && (
                            <CheckCircle2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-black/10 text-xs space-y-1 font-mono">
                          <div className="text-[10px] font-bold uppercase text-neutral-500 font-text">Destino de Pago Móvil Bukea:</div>
                          <div className="text-black font-bold">Banco Mercantil (0105) · J-50123456-7</div>
                          <div className="text-neutral-700">Tel: 0414-1234567 · Monto: Bs. 36.50</div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            NÚMERO DE REFERENCIA
                          </label>
                          <input
                            type="text"
                            placeholder="Últimos 4 a 6 dígitos de la transacción"
                            value={pmReference}
                            onChange={(e) => setPmReference(e.target.value)}
                            className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER FIJO CON CTA PRINCIPAL Y GARANTÍAS */}
        <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 border-t border-black/10 space-y-2">
          <button
            type="button"
            onClick={handleConfirmReservation}
            disabled={isSubmitting}
            className="btn-solid w-full py-3.5 text-xs font-bold justify-center shadow-lg cursor-pointer flex items-center gap-2 group"
          >
            {isSubmitting ? (
              <span>Garantizando y verificando cupo…</span>
            ) : (
              <>
                <ShieldCheck size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>
                  {guaranteeType === 'puntos'
                    ? 'GARANTIZAR RESERVA · 40 PUNTOS'
                    : 'GARANTIZAR RESERVA · $1.00 USD'}
                </span>
              </>
            )}
          </button>

          <div className="text-center space-y-0.5">
            <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
              <Lock size={10} />
              <span>100% REEMBOLSABLE / DESCONTABLE EN FACTURA</span>
            </div>
            <div className="text-[9px] text-neutral-400 leading-tight">
              Cancelación sin penalidad hasta 2 horas antes del evento. Tasa oficial BCV.
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
