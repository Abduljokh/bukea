'use client';

import { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Star, 
  Plus, 
  ChevronRight, 
  MessageCircle, 
  CalendarCheck,
  Check
} from 'lucide-react';

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

interface MenuDigitalProps {
  bizName?: string;
  whatsapp?: string;
  onGoToReserve?: () => void;
}

export default function MenuDigital({ bizName = 'el restaurante', whatsapp, onGoToReserve }: MenuDigitalProps) {
  const [cat, setCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Filtrado reactivo estilo PedidosYa (por categoría o búsqueda libre)
  const filteredDishes = useMemo(() => {
    return MENU.filter(d => {
      const matchCat = cat === 'Todos' || d.cat === cat;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || 
        d.name.toLowerCase().includes(q) || 
        d.desc.toLowerCase().includes(q) ||
        d.ing.some(i => i.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [cat, search]);

  return (
    <div className="pb-16 font-text">
      {/* Buscador Interactivo de Platos */}
      <div className="relative mb-3.5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar plato, ingrediente o especialidad…"
          className="w-full bg-neutral-100/80 border border-black/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selector de Categorías (Pills Horizontales Estilo PedidosYa) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none sticky top-12 bg-white/95 backdrop-blur-sm z-10 pt-1 border-b border-black/5">
        {CATS.map(c => {
          const isActive = cat === c;
          const count = c === 'Todos' ? MENU.length : MENU.filter(d => d.cat === c).length;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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

      {/* Lista de Platos Estilo PedidosYa */}
      {filteredDishes.length === 0 ? (
        <div className="p-10 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-black/5 my-4">
          No encontramos platos que coincidan con &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDishes.map((dish, idx) => (
            <article
              key={idx}
              onClick={() => setSelectedDish(dish)}
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
                  <span className="font-mono font-extrabold text-xs sm:text-sm text-black">
                    {dish.price}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400 group-hover:text-black transition-colors flex items-center gap-0.5">
                    <span>Ver detalle</span>
                    <ChevronRight size={11} />
                  </span>
                </div>
              </div>

              {/* Imagen del Plato (Derecha, formato cuadrado PedidosYa) */}
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
          ))}
        </div>
      )}

      {/* MODAL BOTTOM-SHEET: DETALLE COMPLETO DEL PLATO */}
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

            {/* Título & Precio */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  {selectedDish.cat}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-black leading-tight">
                  {selectedDish.name}
                </h3>
              </div>
              <span className="text-base sm:text-lg font-mono font-extrabold text-black shrink-0">
                {selectedDish.price}
              </span>
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
