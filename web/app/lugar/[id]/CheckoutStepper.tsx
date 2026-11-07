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
  Utensils,
  Globe,
  QrCode
} from 'lucide-react';
import { Business } from '@/app/data/businesses';

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

  // Countdown timer: 5 minutes (300 seconds) + Atomic Hold ID (inspirado en OpenResto)
  const [timeLeft, setTimeLeft] = useState(250); // 04:10 inicial para coincidir con la referencia
  const [holdId] = useState(() => `hold_${Math.random().toString(36).substring(2, 8)}`);

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
  const [paymentMethod, setPaymentMethod] = useState<'c2p' | 'pagomovil' | 'binance' | 'stripe'>('c2p');

  // PASO 3: Identidad y Datos de Pago
  // Identidad en DOS CAMPOS separados (Tipo y Número)
  const [idDocType, setIdDocType] = useState<'V' | 'E' | 'J' | 'P'>('V');
  const [idNumber, setIdNumber] = useState('');

  // Si cambia a C2P o Pago Móvil y tenía seleccionado Pasaporte (P), revertir a V
  useEffect(() => {
    if ((paymentMethod === 'c2p' || paymentMethod === 'pagomovil') && idDocType === 'P') {
      setIdDocType('V');
    }
  }, [paymentMethod, idDocType]);

  // Datos específicos C2P
  const [selectedBank, setSelectedBank] = useState('0134');
  const [affiliatedPhone, setAffiliatedPhone] = useState('');
  const [c2pToken, setC2pToken] = useState('');
  const [requestedToken, setRequestedToken] = useState(false);

  // Datos específicos Pago Móvil
  const [pmReference, setPmReference] = useState('');

  // Datos específicos Binance Pay
  const [binanceSenderId, setBinanceSenderId] = useState('');
  const [binanceOrderId, setBinanceOrderId] = useState('');

  // Datos específicos Stripe
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

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
      if (!idNumber.trim()) {
        setActiveStep(3);
        setStepError('Por favor ingresa tu número de documento de identidad o pasaporte.');
        return;
      }
      if (paymentMethod === 'c2p') {
        if (!affiliatedPhone.trim()) {
          setActiveStep(3);
          setStepError('Por favor ingresa el teléfono afiliado a tu banco.');
          return;
        }
        if (!c2pToken.trim()) {
          setActiveStep(3);
          setStepError('Por favor ingresa el token OTP SMS recibido de tu banco.');
          return;
        }
      }
      if (paymentMethod === 'pagomovil' && !pmReference.trim()) {
        setActiveStep(3);
        setStepError('Por favor ingresa el número de referencia del Pago Móvil.');
        return;
      }
      if (paymentMethod === 'binance' && !binanceOrderId.trim()) {
        setActiveStep(3);
        setStepError('Por favor ingresa el Order ID o referencia de tu transacción en Binance Pay.');
        return;
      }
      if (paymentMethod === 'stripe') {
        if (!cardNumber.trim() || !cardExp.trim() || !cardCvc.trim()) {
          setActiveStep(3);
          setStepError('Por favor completa todos los datos de tu tarjeta.');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // Simulación de aprobación de Débito Inmediato / Verificación Anti-Spam
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

  // Determinar si pasaporte está permitido
  const allowsPassport = paymentMethod === 'binance' || paymentMethod === 'stripe';

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl bg-[#FAFAFA] border border-black/10 shadow-2xl flex flex-col overflow-hidden text-[#0A0A0A] font-text my-auto">
        
        {/* TOPBAR CO-BRANDED CON ESTILO MARGARITA VIP */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center transition-colors text-black cursor-pointer"
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
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline font-mono text-[10px] text-amber-800/80 uppercase font-semibold">
              ID {holdId}
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-950 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300/40">
              <Clock size={12} className="text-amber-700" />
              <span>Mesa retenida: {formatTimer(timeLeft)}</span>
            </div>
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
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  fullName && phoneNumber ? 'bg-emerald-500 text-white' : 'bg-black text-white'
                }`}>
                  {fullName && phoneNumber ? <Check size={14} /> : '1'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <User size={14} className="text-black shrink-0" />
                      <span>Información</span>
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
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ej. Carlos Mendoza"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                      className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white"
                    />
                    {fullName.length >= 3 && (
                      <CheckCircle2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                    WHATSAPP DE CONFIRMACIÓN
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        style={{ paddingRight: '32px' }}
                        className="input-minimal text-xs font-medium bg-neutral-50/60 focus:bg-white cursor-pointer"
                      >
                        <option value="+58">VE +58</option>
                        <option value="+1">US +1</option>
                        <option value="+34">ES +34</option>
                        <option value="+57">CO +57</option>
                        <option value="+52">MX +52</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="412 1234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                        className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white"
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
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep > 2 ? 'bg-emerald-500 text-white' : 'bg-black text-white'
                }`}>
                  {activeStep > 2 ? <Check size={14} /> : '2'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                      <span>Verificación</span>
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
                {/* SELECTOR: ABONO $1 USD vs PUNTOS BUKEA ($1 = 1 PTO) */}
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
                    <span>PUNTOS BUKEA (1 PTO)</span>
                  </button>
                </div>

                {/* CALLOUT: POLÍTICA DE CRÉDITO Y PUNTOS BUKEA */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles size={13} className="text-amber-600 shrink-0" />
                    <span>Garantía de Mesa y Crédito de Consumo</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    El pago de reserva <strong className="font-bold text-amber-950">no es reembolsable</strong>, pero es <strong className="font-bold text-amber-950">100% utilizable como crédito</strong> en tu consumo en el establecimiento o transferible a Puntos Bukea.
                  </p>
                  <div className="pt-1 border-t border-amber-200/50 text-[10px] text-amber-800 font-medium flex items-center gap-1">
                    <Coins size={11} className="text-amber-600 shrink-0" />
                    <span><strong>Puntos Bukea: $1 = 1 punto</strong> · Canjeables por reservas prioritarias y cupones.</span>
                  </div>
                </div>

                {/* BOTONES PARA ELEGIR ENTRE C2P, PAGO MÓVIL, BINANCE PAY O STRIPE */}
                {guaranteeType === 'abono' && (
                  <div>
                    <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                      MÉTODO DE GARANTÍA INSTANTÁNEA
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. C2P */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('c2p')}
                        className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'c2p'
                            ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-600'
                        }`}
                      >
                        <Zap size={14} className={paymentMethod === 'c2p' ? 'text-amber-500 shrink-0' : 'text-neutral-400 shrink-0'} />
                        <span className="truncate">C2P AUTOMÁTICO</span>
                      </button>

                      {/* 2. PAGO MÓVIL */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pagomovil')}
                        className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'pagomovil'
                            ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-600'
                        }`}
                      >
                        <FileText size={14} className={paymentMethod === 'pagomovil' ? 'text-emerald-600 shrink-0' : 'text-neutral-400 shrink-0'} />
                        <span className="truncate">PAGO MÓVIL</span>
                      </button>

                      {/* 3. BINANCE PAY */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('binance')}
                        className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'binance'
                            ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-600'
                        }`}
                      >
                        <Coins size={14} className={paymentMethod === 'binance' ? 'text-amber-500 shrink-0' : 'text-neutral-400 shrink-0'} />
                        <span className="truncate">BINANCE PAY</span>
                      </button>

                      {/* 4. STRIPE */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('stripe')}
                        className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          paymentMethod === 'stripe'
                            ? 'bg-white border-black text-black shadow-sm ring-1 ring-black'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-600'
                        }`}
                      >
                        <Globe size={14} className={paymentMethod === 'stripe' ? 'text-indigo-600 shrink-0' : 'text-neutral-400 shrink-0'} />
                        <span className="truncate">STRIPE (TARJETAS)</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mt-2 px-1">
                      <span>
                        {paymentMethod === 'c2p' && 'DÉBITO INMEDIATO C2P (BS. 36.50)'}
                        {paymentMethod === 'pagomovil' && 'TRANSFERENCIA PAGO MÓVIL (BS. 36.50)'}
                        {paymentMethod === 'binance' && 'PAGO DIRECTO EN USDT'}
                        {paymentMethod === 'stripe' && 'VISA / MASTERCARD INTERNACIONAL ($1 USD)'}
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Zap size={11} className="fill-current text-emerald-600" />
                        <span>VERIFICACIÓN EN 5 SEG</span>
                      </span>
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
          {/* PASO 3: SELECCIÓN DE BANCO Y DATOS DE IDENTIDAD (2 CAMPOS)   */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <CreditCard size={14} className="text-black shrink-0" />
                      <span>
                        Pago ({
                          guaranteeType === 'puntos'
                            ? 'Puntos Bukea'
                            : paymentMethod === 'c2p'
                            ? 'C2P'
                            : paymentMethod === 'pagomovil'
                            ? 'Pago Móvil'
                            : paymentMethod === 'binance'
                            ? 'Binance Pay'
                            : 'Stripe'
                        })
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-black/10 text-[9px] font-bold">
                      {guaranteeType === 'puntos' ? '1 PUNTO' : paymentMethod === 'binance' ? '1.00 USDT' : '$1.00 USD'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {guaranteeType === 'puntos'
                      ? 'Blindaje mediante Puntos Bukea.'
                      : 'Ingresa los datos para validar la garantía.'}
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
                    <Coins size={30} className="mx-auto text-amber-500" />
                    <div className="font-bold text-xs text-amber-950">Canje de Garantía con Puntos Bukea</div>
                    <p className="text-[11px] text-amber-800 max-w-xs mx-auto leading-relaxed">
                      Se debitará <strong>1 Punto Bukea ($1 = 1 punto)</strong> de tu cuenta para blindar esta mesa sin necesidad de pago bancario.
                    </p>
                    <div className="text-[10px] text-neutral-500 pt-1">
                      Puntos Bukea: Canjeables por reservas y cupones exclusivos.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* CAMPOS DE IDENTIDAD DEL TITULAR: DOS CAMPOS SEPARADOS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* CAMPO 1: SELECCIÓN SIMPLE DE TIPO DE DOCUMENTO */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                          TIPO DE DOCUMENTO
                        </label>
                        <div className="relative">
                          <select
                            value={idDocType}
                            onChange={(e) => setIdDocType(e.target.value as any)}
                            style={{ paddingRight: '32px' }}
                            className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-medium cursor-pointer"
                          >
                            <option value="V">V — Venezolano</option>
                            <option value="E">E — Extranjero</option>
                            <option value="J">J — Jurídico (RIF)</option>
                            {allowsPassport && (
                              <option value="P">P — Pasaporte</option>
                            )}
                          </select>
                          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* CAMPO 2: NÚMERO DE IDENTIDAD O PASAPORTE */}
                      <div>
                        <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                          {idDocType === 'P' ? 'NÚMERO DE PASAPORTE' : 'NÚMERO DE IDENTIDAD'}
                        </label>
                        <input
                          type="text"
                          placeholder={idDocType === 'P' ? 'Ej. P12345678' : 'Ej. 18492011'}
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-mono"
                        />
                      </div>
                    </div>

                    {/* =================================================== */}
                    {/* 1. CAMPOS ESPECÍFICOS DE C2P AUTOMÁTICO             */}
                    {/* =================================================== */}
                    {paymentMethod === 'c2p' && (
                      <div className="space-y-3 pt-1 border-t border-black/5">
                        {/* BANCO EMISOR */}
                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            BANCO EMISOR
                          </label>
                          <div className="relative">
                            <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              style={{ paddingLeft: '44px', paddingRight: '32px' }}
                              className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white cursor-pointer font-medium"
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

                        {/* TELÉFONO AFILIADO */}
                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            TELÉFONO AFILIADO AL BANCO
                          </label>
                          <div className="relative">
                            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <input
                              type="tel"
                              placeholder="0412 1234567"
                              value={affiliatedPhone}
                              onChange={(e) => setAffiliatedPhone(e.target.value)}
                              style={{ paddingLeft: '44px' }}
                              className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* TOKEN OTP SMS */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
                              TOKEN BANCARIO DINÁMICO (OTP SMS)
                            </label>
                            <button
                              type="button"
                              onClick={() => setRequestedToken(true)}
                              className="text-[10px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider cursor-pointer flex items-center gap-1"
                            >
                              {requestedToken ? (
                                <>
                                  <Check size={11} strokeWidth={3} />
                                  <span>CLAVE ENVIADA</span>
                                </>
                              ) : (
                                'SOLICITAR CLAVE'
                              )}
                            </button>
                          </div>
                          <div className="relative">
                            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Ingresa clave SMS recibida (6-8 dígitos)"
                              value={c2pToken}
                              onChange={(e) => setC2pToken(e.target.value)}
                              style={{ paddingLeft: '44px', paddingRight: '44px' }}
                              className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white font-mono"
                            />
                            {c2pToken.length >= 6 && (
                              <CheckCircle2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* =================================================== */}
                    {/* 2. CAMPOS ESPECÍFICOS DE PAGO MÓVIL DIRECTO        */}
                    {/* =================================================== */}
                    {paymentMethod === 'pagomovil' && (
                      <div className="space-y-3 pt-1 border-t border-black/5">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-black/10 text-xs space-y-1 font-mono">
                          <div className="text-[10px] font-bold uppercase text-neutral-500 font-text">Destino de Pago Móvil Bukea:</div>
                          <div className="text-black font-bold">Banco Mercantil (0105) · J-50123456-7</div>
                          <div className="text-neutral-700">Tel: 0414-1234567 · Monto: Bs. 36.50</div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            BANCO EMISOR DE TU PAGO
                          </label>
                          <div className="relative">
                            <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              style={{ paddingLeft: '44px', paddingRight: '32px' }}
                              className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white cursor-pointer font-medium"
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

                    {/* =================================================== */}
                    {/* 3. CAMPOS ESPECÍFICOS DE BINANCE PAY (USDT)         */}
                    {/* =================================================== */}
                    {paymentMethod === 'binance' && (
                      <div className="space-y-3 pt-1 border-t border-black/5">
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Binance Pay Oficial Bukea</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-bold">1.00 USDT</span>
                          </div>
                          <div className="text-xs font-bold text-black font-mono">
                            Binance Pay ID: 482910542
                          </div>
                          <div className="text-[10px] text-amber-800">
                            Envía 1.00 USDT desde la app de Binance Pay y escribe tu Order ID o usuario para confirmación inmediata.
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            TU BINANCE PAY ID O EMAIL
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. 192837465 o usuario@binance.com"
                            value={binanceSenderId}
                            onChange={(e) => setBinanceSenderId(e.target.value)}
                            className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            ORDER ID / REFERENCIA DE TRANSACCIÓN
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. 3089482910"
                            value={binanceOrderId}
                            onChange={(e) => setBinanceOrderId(e.target.value)}
                            className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* =================================================== */}
                    {/* 4. CAMPOS ESPECÍFICOS DE STRIPE (TARJETAS)          */}
                    {/* =================================================== */}
                    {paymentMethod === 'stripe' && (
                      <div className="space-y-3 pt-1 border-t border-black/5">
                        <div className="p-3 rounded-xl bg-neutral-50 border border-black/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-indigo-600" />
                            <span className="font-semibold text-neutral-800">Tarjeta Visa / Mastercard</span>
                          </div>
                          <span className="font-bold text-black font-mono">$1.00 USD</span>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                            NÚMERO DE TARJETA
                          </label>
                          <div className="relative">
                            <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="4242 •••• •••• 4242"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              style={{ paddingLeft: '44px' }}
                              className="input-minimal has-icon-left text-xs bg-neutral-50/60 focus:bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                              VENCIMIENTO
                            </label>
                            <input
                              type="text"
                              placeholder="MM / AA"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-mono text-center"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1">
                              CVC / CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="123"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="input-minimal text-xs bg-neutral-50/60 focus:bg-white font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* FOOTER FIJO CON CTA PRINCIPAL Y POLÍTICA ACTUALIZADA */}
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
                    ? 'GARANTIZAR RESERVA · 1 PUNTO BUKEA'
                    : paymentMethod === 'binance'
                    ? 'GARANTIZAR RESERVA · 1.00 USDT'
                    : 'GARANTIZAR RESERVA · $1.00 USD'}
                </span>
              </>
            )}
          </button>

          <div className="text-center space-y-0.5">
            <div className="text-[10px] font-bold text-neutral-800 flex items-center justify-center gap-1">
              <Lock size={10} className="text-emerald-600" />
              <span>CRÉDITO 100% APLICABLE EN CONSUMO O PUNTOS BUKEA</span>
            </div>
            <div className="text-[9px] text-neutral-500 leading-tight">
              No reembolsable en efectivo/banco · Utilizable como consumo en mesa o transferible a Puntos Bukea ($1 = 1 pto).
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
