'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share2, 
  Star, 
  MapPin, 
  Box, 
  MessageCircle, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Business, 
  BUSINESSES_MOCK, 
  StoredReservation, 
  Dish, 
  normalizeBusiness, 
  DEFAULT_AR_DISHES,
  formatCuisineHeader 
} from '../../data/businesses';
import MapaGoogle from './MapaGoogle';
import ReviewsList from './ReviewsList';
import CarruselFotos from './CarruselFotos';
import MenuDigital from './MenuDigital';

const fmtTime = (s: string) => {
  try {
    return new Date(s).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
};

const fmtDate = (d: string) => {
  try {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  } catch {
    return d;
  }
};

export default function LugarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [b, setB] = useState<Business | null>(() => {
    if (!id) return null;
    return BUSINESSES_MOCK.find(m => m.id === id || m.slug === id) || null;
  });
  const [date, setDate] = useState<string>(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [slots, setSlots] = useState<{ start: string; end: string; available: boolean }[]>([]);
  const [sel, setSel] = useState<{ start: string; end: string; available: boolean } | null>(null);
  const [size, setSize] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuDigital, setMenuDigital] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [arDish, setArDish] = useState<Dish | null>(null);
  const [showAllAr, setShowAllAr] = useState(false);

  // Buscar negocio (API o Mock)
  useEffect(() => {
    if (!id) return;
    const mock = BUSINESSES_MOCK.find(m => m.id === id || m.slug === id);
    if (mock) setB(mock);

    fetch(`/api/web/businesses/${id}`)
      .then(r => r.json())
      .then(d => {
        const fetched = d.business || d;
        if (fetched && fetched.name) {
          setB(normalizeBusiness(fetched));
        }
      })
      .catch(() => {});
  }, [id]);

  // Actualizar título de la pestaña con la colaboración oficial
  useEffect(() => {
    if (b?.name) {
      document.title = `Bukea × ${b.name}`;
    }
  }, [b?.name]);

  // Horarios de disponibilidad (API o Generados)
  useEffect(() => {
    if (!id) return;
    fetch(`/api/web/businesses/${id}/availability?date=${date}&size=${size}`)
      .then(r => r.json())
      .then(d => {
        if (d.slots && d.slots.length > 0) {
          setSlots(d.slots);
          setSel(d.slots[0]);
        } else {
          generarSlotsMock();
        }
      })
      .catch(() => {
        generarSlotsMock();
      });
  }, [id, date, size]);

  const generarSlotsMock = () => {
    const mockHours = ['12:30', '13:30', '15:00', '17:30', '19:00', '20:30', '21:30'];
    const generated = mockHours.map(h => ({
      start: `${date}T${h}:00`,
      end: `${date}T${h}:00`,
      available: true
    }));
    setSlots(generated);
    setSel(generated[3]);
  };

  // Obtener los platos con modelo 3D (garantizando siempre mínimo 4)
  const arDishesList = useMemo(() => {
    if (!b) return DEFAULT_AR_DISHES;
    let list = (b.dishes || []).filter(d => d.has3D ?? true);
    if (list.length < 4) {
      // Completar hasta tener al menos 4
      const combined = [...list];
      DEFAULT_AR_DISHES.forEach(def => {
        if (combined.length < 4 && !combined.find(x => x.name === def.name)) {
          combined.push(def);
        }
      });
      list = combined;
    }
    return list;
  }, [b]);

  // Lista a mostrar: 4 fijos por defecto, expandible si el usuario pulsa "Ver más"
  const visibleArDishes = showAllAr ? arDishesList : arDishesList.slice(0, 4);

  const handleReservar = async () => {
    setErr('');
    if (!sel) {
      setErr('Por favor selecciona un horario para tu reserva.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/web/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: id,
          guest_name: name || 'Invitado Bukea',
          guest_phone: phone || '',
          guest_size: size,
          slot_start: sel.start,
        }),
      }).then(r => r.json());

      const finalCode = res.reservation?.code || `BK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setCode(finalCode);

      if (b) {
        const newReservation: StoredReservation = {
          code: finalCode,
          businessId: b.id,
          businessName: b.name,
          businessImage: b.heroImage,
          businessAddress: b.address,
          date: fmtDate(date),
          time: fmtTime(sel.start),
          guests: size,
          guestName: name || 'Invitado Bukea',
          guestPhone: phone || '',
          status: 'confirmada',
          createdAt: new Date().toISOString(),
          perks: b.perks || ['Atención preferencial Bukea'],
        };

        const existing = JSON.parse(localStorage.getItem('bukea_reservations') || '[]');
        const updated = [newReservation, ...existing.filter((x: any) => x.code !== finalCode)];
        localStorage.setItem('bukea_reservations', JSON.stringify(updated));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      const localCode = `BK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setCode(localCode);
      if (b) {
        const newReservation: StoredReservation = {
          code: localCode,
          businessId: b.id,
          businessName: b.name,
          businessImage: b.heroImage,
          businessAddress: b.address,
          date: fmtDate(date),
          time: fmtTime(sel.start),
          guests: size,
          guestName: name || 'Invitado Bukea',
          guestPhone: phone || '',
          status: 'confirmada',
          createdAt: new Date().toISOString(),
          perks: b.perks || ['Atención preferencial Bukea'],
        };
        const existing = JSON.parse(localStorage.getItem('bukea_reservations') || '[]');
        localStorage.setItem('bukea_reservations', JSON.stringify([newReservation, ...existing]));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (!b) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-neutral-400 text-sm font-text">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Cargando restaurante…</span>
        </div>
      </div>
    );
  }

  // Header formal: "Comida [TIPO]"
  const cuisineHeader = formatCuisineHeader(b.cuisine);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pb-28 font-text">
      {/* Topbar Flotante Liquid Glass */}
      <header className="liquid-glass-header flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center text-black hover:bg-neutral-200 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={17} />
        </button>

        <div className="text-center flex flex-col items-center">
          {/* Logo Bukea + Nombre del Restaurante */}
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-logo text-2xl text-black pt-0.5">Bukea</span>
            <span className="text-xs text-neutral-400 font-light font-text">×</span>
            <span className="text-sm font-bold text-black tracking-tight font-text">
              {b.name}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
            {cuisineHeader} · {b.zone}
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== 'undefined' && navigator.share) {
              navigator.share({ title: `Bukea × ${b.name}`, url: window.location.href });
            }
          }}
          className="w-9 h-9 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center text-black hover:bg-neutral-200 transition-colors"
          aria-label="Compartir"
        >
          <Share2 size={15} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-3">
        {/* Carrusel de Fotos HD */}
        <section className="mb-5">
          <CarruselFotos fotos={b.carousel || []} />
        </section>

        {/* Información Principal del Negocio */}
        <section className="liquid-glass-card p-5 sm:p-6 mb-5 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Badge Minimalista con "Comida [TIPO]" */}
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-minimal-dark">
                  {cuisineHeader}
                </span>
                {b.featuredBadge && (
                  <span className="badge-minimal">
                    {b.featuredBadge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-logo text-3xl sm:text-4xl text-black leading-none pt-1">
                  Bukea
                </span>
                <span className="text-lg sm:text-xl text-neutral-400 font-light font-text">
                  ×
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-black font-text tracking-tight">
                  {b.name}
                </h1>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1 text-black font-bold text-base">
                <Star size={15} fill="currentColor" />
                <span>{(b.rating ?? 4.8).toFixed(1)}</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {b.reviewCount ?? 84} opiniones
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-3">
            <MapPin size={14} className="text-neutral-400 shrink-0" />
            <span>{b.address}</span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed">
            {b.description}
          </p>

          {/* Beneficios VIP */}
          {b.perks && b.perks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/10">
              <div className="text-[11px] font-semibold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-neutral-600" />
                <span>Beneficios de Reserva</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {b.perks.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-800 bg-neutral-50 px-3 py-1.5 rounded-xl border border-black/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* MOTOR DE RESERVA / CONFIRMACIÓN */}
        <section id="reserva-section" className="mb-5">
          {code ? (
            <div className="liquid-glass-card p-6 text-black text-center bg-white border-black/20">
              <div className="w-12 h-12 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center mx-auto mb-3 text-black">
                <CheckCircle2 size={26} />
              </div>
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                Reserva Confirmada
              </div>
              <div className="text-3xl font-extrabold font-mono text-black tracking-widest my-2">
                {code}
              </div>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto mb-5 leading-relaxed">
                Presenta este código al llegar a <span className="text-black font-semibold">{b.name}</span>.<br />
                {fmtDate(date)} a las {sel && fmtTime(sel.start)} · {size} personas.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/10">
                <button
                  onClick={() => router.push('/')}
                  className="btn-solid text-xs py-2.5 w-full justify-center"
                >
                  Ver en mi Wallet
                </button>
                <button
                  onClick={() => setCode(null)}
                  className="btn-glass text-xs py-2.5 w-full justify-center"
                >
                  Nueva Reserva
                </button>
              </div>
            </div>
          ) : (
            <div className="liquid-glass-card p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Configurar Reserva</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Sin comisión
                </div>
              </div>

              {/* Selector de Fecha y Comensales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-minimal text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                    Personas
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="input-minimal text-xs bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'persona' : 'personas'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slots de Horario */}
              <div className="mb-5">
                <label className="text-[11px] font-semibold text-neutral-700 block mb-2 flex items-center justify-between">
                  <span>Horarios Disponibles</span>
                  <span className="text-[10px] text-neutral-400">Hora local (VET)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s, idx) => (
                    <button
                      key={idx}
                      data-selected={sel === s}
                      onClick={() => setSel(s)}
                      className="slot-pill"
                    >
                      {fmtTime(s.start)}
                    </button>
                  ))}
                </div>
              </div>

              {err && (
                <div className="p-3 rounded-xl bg-neutral-100 border border-black/10 text-neutral-800 text-xs mb-4">
                  {err}
                </div>
              )}

              {/* Botón de Continuar */}
              <button
                onClick={handleReservar}
                disabled={loading}
                className="btn-solid w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Procesando…</span>
                ) : (
                  <>
                    <span>Continuar con la Reserva{sel ? ` · ${fmtTime(sel.start)}` : ''}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* PLATOS EN REALIDAD AUMENTADA (SIEMPRE 4 CON BOTÓN DE VER MÁS CUANDO LO AMERITE) */}
        <section className="liquid-glass-card p-5 sm:p-6 mb-5 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
              <Box size={14} />
              <span>Platos en Realidad Aumentada</span>
            </div>
            <span className="badge-minimal">
              4 Platos 3D
            </span>
          </div>

          <p className="text-xs text-neutral-500 mb-4">
            Visualiza la gastronomía en tres dimensiones antes de pedir.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleArDishes.map((dish, idx) => (
              <div
                key={idx}
                onClick={() => setArDish(dish)}
                className="p-3 rounded-2xl bg-neutral-50/70 border border-black/8 hover:border-black/25 cursor-pointer transition-all flex gap-3 items-center group"
              >
                <img
                  src={dish.photo}
                  alt={dish.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-black/5"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-black group-hover:text-neutral-700 truncate">
                    {dish.name}
                  </div>
                  <div className="text-xs text-neutral-900 font-bold mt-0.5">{dish.price}</div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1">
                    <Box size={11} className="text-black" />
                    <span>Ver en 3D / AR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón de Ver Más Platos AR cuando hay más de 4 */}
          {arDishesList.length > 4 && (
            <div className="mt-4 pt-3 border-t border-black/10 text-center">
              <button
                onClick={() => setShowAllAr(!showAllAr)}
                className="btn-glass text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <span>
                  {showAllAr 
                    ? 'Mostrar menos platos AR' 
                    : `Ver más platos en Realidad Aumentada (${arDishesList.length - 4} más)`}
                </span>
                {showAllAr ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          )}
        </section>

        {/* UBICACIÓN & GOOGLE MAPS */}
        <section className="liquid-glass-card p-5 sm:p-6 mb-5 bg-white">
          <div className="text-xs font-bold text-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin size={14} />
            <span>Ubicación</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-black/10 mb-3">
            <MapaGoogle name={b.name} lat={b.lat} lng={b.lng} />
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${b.name} ${b.address}`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-solid w-full text-xs py-3 flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            <span>Abrir en Google Maps</span>
          </a>
        </section>

        {/* RESEÑAS VERIFICADAS */}
        <section className="liquid-glass-card p-5 sm:p-6 bg-white">
          <div className="text-xs font-bold text-black uppercase tracking-wider mb-3">
            Opiniones de Comensales
          </div>
          <ReviewsList bizId={b.id} />
        </section>
      </main>

      {/* Barra Flotante Inferior de CTAs en Frosted Glass Sólido */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] liquid-glass-dock rounded-full p-1.5 flex items-center justify-between gap-1 shadow-2xl">
        <button
          onClick={() => setMenuDigital(true)}
          className="flex-1 py-2 px-2.5 rounded-full text-black hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer text-center"
        >
          <BookOpen size={14} className="shrink-0" />
          <span>Ver Menú</span>
        </button>

        <button
          onClick={() => {
            document.getElementById('reserva-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="btn-solid py-2 px-4 rounded-full text-xs font-bold shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CalendarCheck size={14} className="shrink-0" />
          <span>Reservar</span>
        </button>

        {b.whatsapp && (
          <a
            href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${b.name}, los contacto desde Bukea para consultar sobre sus mesas y reservas.`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 px-2.5 rounded-full text-black hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-center"
          >
            <MessageCircle size={14} className="text-emerald-600 shrink-0" />
            <span>WhatsApp</span>
          </a>
        )}
      </nav>

      {/* MODAL: MENÚ DIGITAL COMPLETO */}
      {menuDigital && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <header className="liquid-glass-header flex items-center justify-between">
            <button
              onClick={() => setMenuDigital(false)}
              className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-black"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-logo text-xl text-black pt-0.5">Bukea</span>
              <span className="text-xs text-neutral-400 font-light font-text">×</span>
              <span className="font-semibold text-sm text-black">Carta de {b.name}</span>
            </div>
            <div className="w-9" />
          </header>
          <div className="max-w-2xl mx-auto p-4">
            <MenuDigital
              bizName={b.name}
              whatsapp={b.whatsapp}
              onGoToReserve={() => {
                setMenuDigital(false);
                setTimeout(() => {
                  document.getElementById('reserva-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL: TOUR VIRTUAL 360° */}
      {tourOpen && b.tour_360 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden bg-black border border-white/20">
            <button
              onClick={() => setTourOpen(false)}
              className="absolute top-4 right-4 z-50 px-4 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              Cerrar ✕
            </button>
            <iframe
              src={b.tour_360}
              className="w-full h-full border-0"
              title="Tour Virtual 360"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* MODAL: VISOR DE PLATO 3D / AR */}
      {arDish && (
        <div
          onClick={() => setArDish(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass-card max-w-md w-full p-6 text-center bg-white border-black/20"
          >
            <div className="font-bold text-base text-black">{arDish.name}</div>
            <div className="text-xs text-neutral-800 font-bold mt-1">{arDish.price}</div>
            <p className="text-xs text-neutral-600 mt-2">{arDish.desc}</p>

            <div className="h-64 my-4 rounded-2xl overflow-hidden bg-neutral-100 border border-black/10">
              <model-viewer
                src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                ar
                camera-controls
                auto-rotate
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <div className="text-[11px] text-neutral-500 mb-4">
              Arrastra para rotar en 360° o pulsa AR para proyectar en tu mesa.
            </div>

            <button
              onClick={() => setArDish(null)}
              className="btn-solid w-full text-xs py-2.5 justify-center"
            >
              Cerrar Visor 3D
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
