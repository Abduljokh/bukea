'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Star, 
  Plus, 
  ChevronRight, 
  MessageCircle, 
  CalendarCheck,
  Check,
  ArrowLeft,
  Coins
} from 'lucide-react';
import { useBcv } from '@/app/context/BcvContext';

export type Dish = { 
  name: string; 
  desc: string; 
  price: string; 
  cat: string; 
  photo: string; 
  ing: string[];
  isStar?: boolean;
};

const MENU: Dish[] = [
  // Entradas
  { 
    name: 'Carpaccio de Atún Aleta Amarilla', 
    cat: 'Entradas', 
    price: '$15', 
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    desc: 'Láminas finas de atún fresco de Araya con alcaparras crocantes y aceite trufado.',
    ing: ['Atún fresco de Araya', 'Alcaparras crocantes', 'Aceite de oliva extra virgen', 'Parmesano reggiano', 'Limón criollo'],
    isStar: true
  },
  { 
    name: 'Ceviche Mixto Playa El Agua', 
    cat: 'Entradas', 
    price: '$16', 
    photo: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
    desc: 'Pesca del día con leche de tigre al ají dulce margariteño y maíz chulpe crocante.',
    ing: ['Corvina fresca', 'Pulpo tierno', 'Leche de tigre artesanal', 'Cebolla morada', 'Ají dulce margariteño', 'Maíz chulpe'],
    isStar: true
  },
  { 
    name: 'Tequeños Gourmet de Calamar', 
    cat: 'Entradas', 
    price: '$11', 
    photo: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
    desc: 'Masa fina artesanal rellena de calamar con aioli de ajo negro confitado.',
    ing: ['Calamar fresco', 'Panko japonés', 'Aioli de ajo negro', 'Cilantro fresco'] 
  },

  // Del Mar
  { 
    name: 'Langostinos al Fuego de Leña', 
    cat: 'Del mar', 
    price: '$28', 
    photo: 'https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=800&q=80',
    desc: 'Langostinos jumbo marinados en hierbas frescas de la isla y mantequilla noisette.',
    ing: ['Langostinos jumbo', 'Ajos confitados', 'Perejil rizado', 'Pan de masa madre tostado'],
    isStar: true
  },
  { 
    name: 'Mero en Costra de Almendras', 
    cat: 'Del mar', 
    price: '$24', 
    photo: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    desc: 'Filete de mero blanco sobre puré rústico de batata y reducción de cítricos tropicales.',
    ing: ['Mero insular', 'Almendras tostadas', 'Batata asada', 'Emulsión de maracuyá'] 
  },
  { 
    name: 'Risotto de Mariscos & Azafrán', 
    cat: 'Del mar', 
    price: '$22', 
    photo: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    desc: 'Arroz arborio cremoso con calamares, camarones y mejillones de Pampatar.',
    ing: ['Arroz arborio', 'Camarones', 'Mejillones de Pampatar', 'Calamar', 'Fondo de bisque'] 
  },

  // Parrilla
  { 
    name: 'Ribeye Angus 400g Madurado', 
    cat: 'Parrilla', 
    price: '$34', 
    photo: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    desc: 'Corte premium 28 días de maduración servido con chimichurri rústico de la casa.',
    ing: ['Ribeye Angus certified', 'Chimichurri de la casa', 'Papas trufadas al romero'],
    isStar: true
  },
  { 
    name: 'Churrasco al Grill de Quebracho', 
    cat: 'Parrilla', 
    price: '$26', 
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    desc: 'Corte magro a la brasa con yuca frita crocante y mojo criollo artesanal.',
    ing: ['Churrasco prime', 'Salsa criolla de pimientos', 'Yuca frita artesanal'] 
  },

  // Postres
  { 
    name: 'Volcán de Cacao Venezolano', 
    cat: 'Postres', 
    price: '$9', 
    photo: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    desc: 'Cacao de Chuao al 70% con corazón fundido y helado de vainilla Bourbon.',
    ing: ['Chocolate venezolano Chuao', 'Helado de vainilla artesanal', 'Coulis de frutos rojos'],
    isStar: true
  },
  { 
    name: 'Tres Leches de Coco Margariteño', 
    cat: 'Postres', 
    price: '$8', 
    photo: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    desc: 'Bizcocho embebido en leche de coco fresco, ron Santa Teresa y canela.',
    ing: ['Bizcochuelo casero', 'Leche condensada', 'Leche de coco fresco', 'Merengue tostado'] 
  },
];

const CATS = ['Todos', 'Entradas', 'Del mar', 'Parrilla', 'Postres'];
const REAL_CATS = ['Entradas', 'Del mar', 'Parrilla', 'Postres'];

interface MenuDigitalProps {
  bizName?: string;
  whatsapp?: string;
  onClose?: () => void;
  onGoToReserve?: () => void;
}

export default function MenuDigital({ 
  bizName = 'el restaurante', 
  whatsapp, 
  onClose,
  onGoToReserve 
}: MenuDigitalProps) {
  const { bcvRate, toBs } = useBcv();
  const [activeCat, setActiveCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const categoryBarRef = useRef<HTMLDivElement>(null);
  const categoryPillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Filtrado reactivo para búsqueda libre
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return MENU.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.desc.toLowerCase().includes(q) ||
      d.cat.toLowerCase().includes(q) ||
      d.ing.some(i => i.toLowerCase().includes(q))
    );
  }, [search]);

  // Click en categoría: scroll hacia la sección y centrar pill en dock
  const handleCategoryClick = (category: string) => {
    setActiveCat(category);

    const pill = categoryPillRefs.current[category];
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    const modalEl = document.getElementById('menu-digital-modal');

    if (category === 'Todos') {
      if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const slug = `cat-${category.toLowerCase().replace(/\s+/g, '-')}`;
    const targetEl = document.getElementById(slug);
    if (targetEl) {
      if (modalEl) {
        const topPos = targetEl.offsetTop - 145;
        modalEl.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
      } else {
        const rect = targetEl.getBoundingClientRect();
        const topPos = rect.top + window.scrollY - 145;
        window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
      }
    }
  };

  // Scrollspy: detecta qué categoría está pasando por el visor y actualiza el dock
  useEffect(() => {
    if (search.trim()) return;

    const modalEl = document.getElementById('menu-digital-modal');
    const scrollContainer = modalEl || window;

    const handleScroll = () => {
      const containerScrollTop = modalEl ? modalEl.scrollTop : window.scrollY;

      // Si está arriba de todo
      if (containerScrollTop < 80) {
        if (activeCat !== 'Todos') {
          setActiveCat('Todos');
          const pill = categoryPillRefs.current['Todos'];
          if (pill) {
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
        return;
      }

      // Medir posición de cada sección de categoría
      for (let i = REAL_CATS.length - 1; i >= 0; i--) {
        const c = REAL_CATS[i];
        const slug = `cat-${c.toLowerCase().replace(/\s+/g, '-')}`;
        const el = document.getElementById(slug);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Cuando la cabecera de la sección entra o está cerca del dock superior (165px)
          if (rect.top <= 175) {
            if (activeCat !== c) {
              setActiveCat(c);
              const pill = categoryPillRefs.current[c];
              if (pill) {
                pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }
            }
            break;
          }
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [search, activeCat]);

  return (
    <div className="font-text min-h-screen bg-[#FAFAFA] text-[#0A0A0A]">
      {/* ================================================================= */}
      {/* HEADER + BUSCADOR + DOCK DE CATEGORÍAS UNIFICADOS EN UN SOLO STICKY */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/10 shadow-xs">
        {/* Fila 1: Botón Volver + Logo de Colaboración */}
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
          {onClose ? (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center text-black transition-colors cursor-pointer"
              aria-label="Cerrar carta"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-logo text-2xl text-black pt-0.5">Bukea</span>
            <span className="text-xs text-neutral-400 font-light font-text">×</span>
            <span className="font-bold text-xs sm:text-sm text-black tracking-tight font-text">
              Carta de {bizName}
            </span>
          </div>

          <div className="w-8" />
        </div>

        {/* Fila 2: Buscador Interactivo */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plato, ingrediente o especialidad…"
              style={{ paddingLeft: '40px' }}
              className="w-full bg-neutral-100/90 border border-black/10 rounded-xl pr-9 py-2 text-xs text-black placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-black/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {/* Indicador Oficial de Tasa BCV */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1.5 px-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Coins size={12} className="text-neutral-700" />
              <span>Tasa Oficial BCV del día:</span>
              <strong className="text-neutral-900 font-mono">Bs. {bcvRate.toFixed(2)}</strong>
            </span>
            <span className="text-[10px] text-neutral-400">Precios duales en tiempo real</span>
          </div>
        </div>

        {/* Fila 3: Dock de Categorías con Scroll Horizontal y Auto-Highlight */}
        <div 
          ref={categoryBarRef}
          className="max-w-2xl mx-auto px-4 pb-2.5 flex gap-1.5 overflow-x-auto scrollbar-none"
        >
          {CATS.map(c => {
            const isActive = activeCat === c;
            const count = c === 'Todos' ? MENU.length : MENU.filter(d => d.cat === c).length;
            return (
              <button
                key={c}
                ref={(el) => { categoryPillRefs.current[c] = el; }}
                onClick={() => handleCategoryClick(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive 
                    ? 'bg-black text-white shadow-sm' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <span>{c}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ================================================================= */}
      {/* CUERPO PRINCIPAL DEL MENÚ (SECCIONES CATEGORIZADAS)               */}
      {/* ================================================================= */}
      <main className="max-w-2xl mx-auto p-4 pb-24">
        {/* Caso 1: Búsqueda activa */}
        {searchResults !== null ? (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Resultados de búsqueda ({searchResults.length})
            </div>

            {searchResults.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-400 bg-white rounded-2xl border border-black/5 my-4">
                No encontramos platos que coincidan con &ldquo;{search}&rdquo;.
              </div>
            ) : (
              <div className="space-y-2.5">
                {searchResults.map((dish, idx) => (
                  <DishCard key={idx} dish={dish} onClick={() => setSelectedDish(dish)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Caso 2: Menú Completo estructurado en Secciones para Scrollspy */
          <div className="space-y-7">
            {REAL_CATS.map(catName => {
              const catDishes = MENU.filter(d => d.cat === catName);
              const slug = `cat-${catName.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <section key={catName} id={slug} className="scroll-mt-36">
                  {/* Encabezado de Categoría */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/5">
                    <h3 className="font-bold text-sm sm:text-base text-black uppercase tracking-wider font-text flex items-center gap-2">
                      <span>{catName}</span>
                      <span className="text-xs text-neutral-400 font-mono font-normal">
                        ({catDishes.length})
                      </span>
                    </h3>
                  </div>

                  {/* Platos de la Categoría */}
                  <div className="space-y-2.5">
                    {catDishes.map((dish, idx) => (
                      <DishCard key={idx} dish={dish} onClick={() => setSelectedDish(dish)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL BOTTOM-SHEET: DETALLE COMPLETO DEL PLATO                    */}
      {/* ================================================================= */}
      {selectedDish && (
        <div
          onClick={() => setSelectedDish(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-black/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 text-black max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1 rounded-full bg-neutral-200 mx-auto mb-4 sm:hidden" />

            {/* Fotografía HD */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-black/10 bg-neutral-100">
              <img
                src={selectedDish.photo}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center border border-black/10 shadow-sm cursor-pointer hover:bg-white"
                aria-label="Cerrar detalle"
              >
                <X size={16} />
              </button>
              {selectedDish.isStar && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/80 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                  <Star size={11} className="fill-current text-white" />
                  <span>Plato Estrella de la Casa</span>
                </div>
              )}
            </div>

            {/* Título & Precio Dual */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {selectedDish.cat}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-black leading-tight">
                  {selectedDish.name}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-mono font-extrabold text-black block">
                  {selectedDish.price} <span className="text-xs text-neutral-400 font-normal">USD</span>
                </span>
                <span className="text-xs font-semibold text-neutral-600 block mt-0.5">
                  {toBs(Number(selectedDish.price.replace(/[^0-9.]/g, '')) || 15)}
                </span>
                <span className="text-[9px] text-neutral-400 block">Tasa oficial BCV</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              {selectedDish.desc}
            </p>

            {/* Ingredientes en Chips */}
            <div className="text-[10px] font-bold text-black uppercase tracking-wider mb-2">
              Ingredientes & Preparación
            </div>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {selectedDish.ing.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 border border-black/5 text-neutral-700 text-xs font-medium"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Acciones del Plato */}
            <div className="space-y-2">
              {onGoToReserve && (
                <button
                  onClick={() => {
                    setSelectedDish(null);
                    onGoToReserve();
                  }}
                  className="btn-solid w-full text-xs py-3 justify-center gap-2 shadow-md cursor-pointer"
                >
                  <CalendarCheck size={14} />
                  <span>Reservar Mesa para Probar Este Plato</span>
                </button>
              )}

              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${bizName}, estoy viendo su menú digital en Bukea y me interesa el plato "${selectedDish.name}".`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-full border border-black/10 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>Consultar detalles por WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para la Tarjeta de Plato estilo PedidosYa
function DishCard({ dish, onClick }: { dish: Dish; onClick: () => void }) {
  const { toBs } = useBcv();
  const usdValue = Number(dish.price.replace(/[^0-9.]/g, '')) || 15;

  return (
    <article
      onClick={onClick}
      className="p-3.5 rounded-2xl bg-white border border-black/8 hover:border-black/25 hover:shadow-sm transition-all cursor-pointer flex gap-3.5 items-center justify-between group"
    >
      {/* Información del Plato (Izquierda) */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 mb-1">
          {dish.isStar && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-neutral-100 border border-black/10 text-black text-[9px] font-bold uppercase tracking-wider">
              <Star size={9} className="fill-current text-black" />
              <span>Estrella</span>
            </span>
          )}
          <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
            {dish.cat}
          </span>
        </div>

        <h4 className="font-bold text-xs sm:text-sm text-black group-hover:text-neutral-700 leading-snug truncate">
          {dish.name}
        </h4>

        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mt-0.5 mb-2">
          {dish.desc}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-extrabold text-xs sm:text-sm text-black">
              {dish.price}
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">
              · {toBs(usdValue)}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-black transition-colors flex items-center gap-0.5">
            <span>Ver detalle</span>
            <ChevronRight size={11} />
          </span>
        </div>
      </div>

      {/* Imagen del Plato (Derecha, formato cuadrado) */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 border border-black/8">
        <img
          src={dish.photo}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/95 text-black flex items-center justify-center shadow-md border border-black/10 group-hover:bg-black group-hover:text-white transition-colors">
          <Plus size={13} strokeWidth={2.5} />
        </div>
      </div>
    </article>
  );
}
