'use client';

import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Check,
  Building,
  Clock,
  UtensilsCrossed,
  Image as ImageIcon,
  Save,
  Sparkles,
  DollarSign,
  AlertCircle,
  X,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';
import { PartnerDish } from '../data/partnerData';

export default function PartnerPreferenciasPage() {
  const {
    business,
    updateBusinessProfile,
    addDish,
    updateDish,
    deleteDish,
    reorderDish,
    toggleDishAvailability,
  } = usePartner();

  const [activeTab, setActiveTab] = useState<'info' | 'horarios' | 'menu'>('info');

  // Estado del formulario de Información General
  const [formData, setFormData] = useState({
    name: business.name,
    category: business.category,
    cuisineOrSpecialty: business.cuisineOrSpecialty,
    spaceType: business.spaceType,
    description: business.description,
    address: business.address,
    zone: business.zone,
    phone: business.phone,
    whatsapp: business.whatsapp,
    logo: business.logo,
    heroImage: business.heroImage,
    toleranceMinutes: business.toleranceMinutes,
    totalCapacity: business.totalCapacity,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Estados del Gestor de Menú
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<PartnerDish | null>(null);

  // Formulario de Plato
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Del mar',
    priceUSD: 15,
    desc: '',
    photo: '',
    ingredients: '',
    badge: '',
  });

  // Guardar cambios generales
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Agregar foto a galería
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    updateBusinessProfile({
      gallery: [...business.gallery, newPhotoUrl.trim()],
    });
    setNewPhotoUrl('');
  };

  // Eliminar foto de galería
  const handleRemovePhoto = (index: number) => {
    updateBusinessProfile({
      gallery: business.gallery.filter((_, i) => i !== index),
    });
  };

  // Abrir modal de plato (nuevo o editar)
  const openDishModal = (dish?: PartnerDish) => {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        name: dish.name,
        category: dish.category,
        priceUSD: dish.priceUSD,
        desc: dish.desc,
        photo: dish.photo,
        ingredients: dish.ingredients.join(', '),
        badge: dish.badge || '',
      });
    } else {
      setEditingDish(null);
      setDishForm({
        name: '',
        category: 'Del mar',
        priceUSD: 18,
        desc: '',
        photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        ingredients: '',
        badge: '',
      });
    }
    setIsDishModalOpen(true);
  };

  // Guardar plato (crear o actualizar)
  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredientsArray = dishForm.ingredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingDish) {
      updateDish(editingDish.id, {
        name: dishForm.name,
        category: dishForm.category,
        priceUSD: Number(dishForm.priceUSD),
        desc: dishForm.desc,
        photo: dishForm.photo,
        ingredients: ingredientsArray,
        badge: dishForm.badge.trim() || undefined,
      });
    } else {
      addDish({
        name: dishForm.name,
        category: dishForm.category,
        priceUSD: Number(dishForm.priceUSD),
        desc: dishForm.desc,
        photo: dishForm.photo,
        ingredients: ingredientsArray,
        isAvailable: true,
        badge: dishForm.badge.trim() || undefined,
      });
    }

    setIsDishModalOpen(false);
  };

  // Categorías de platos únicas
  const menuCategories = ['Todas', ...Array.from(new Set(business.dishes.map((d) => d.category)))];

  const filteredDishes =
    selectedCategory === 'Todas'
      ? business.dishes
      : business.dishes.filter((d) => d.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* HEADER DE PREFERENCIAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Administrador & Preferencias
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Actualiza la información comercial, horarios, fotos de marca y la carta digital de {business.name}.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cambios guardados con éxito</span>
          </div>
        )}
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        {[
          { id: 'info', label: 'Información & Marca', icon: Building },
          { id: 'horarios', label: 'Horarios & Capacidad', icon: Clock },
          { id: 'menu', label: 'Gestor de Menú / Carta', icon: UtensilsCrossed },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          PESTAÑA 1: INFORMACIÓN GENERAL & MARCA
          ========================================================================= */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Datos Principales del Establecimiento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Categoría de Comercio *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                      spaceType:
                        e.target.value === 'Gym' || e.target.value === 'Hotel' || e.target.value === 'Spa'
                          ? 'capacidad'
                          : 'mesas',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                >
                  <option value="Restaurante">Restaurante (Modo Mesas)</option>
                  <option value="Club de Playa">Club de Playa (Modo Mesas)</option>
                  <option value="Bar">Bar (Modo Mesas)</option>
                  <option value="Discoteca">Discoteca (Modo Mesas)</option>
                  <option value="Gym">Gym / Fitness (Modo Capacidad)</option>
                  <option value="Hotel">Hotel / Posada (Modo Capacidad)</option>
                  <option value="Spa">Spa & Wellness (Modo Capacidad)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Tipo de Cocina / Especialidad (Formato: Comida [TIPO]) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cuisineOrSpecialty}
                  onChange={(e) => setFormData({ ...formData, cuisineOrSpecialty: e.target.value })}
                  placeholder="Ej. Comida de Playa & Fusión Marina"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Zona / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ej. Pampatar, Isla de Margarita"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Descripción Completa del Lugar
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Dirección Exacta
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  WhatsApp de Reservas Directas
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+58 412 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Teléfono Local
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+58 295 262 1100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
              </div>
            </div>
          </div>

          {/* GESTOR DE MULTIMEDIA (LOGO Y FOTOS) */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Imágenes y Marca Visual
            </h3>

            {/* Logo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0">
                <img
                  src={formData.logo}
                  alt="Logo del negocio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  URL del Logo Oficial
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Recomendado: Imagen cuadrada de 400x400 px con fondo transparente o blanco.
                </p>
              </div>
            </div>

            {/* Portada Principal */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                URL de Portada Panorámica (Hero Image)
              </label>
              <input
                type="url"
                value={formData.heroImage}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
              />
              <div className="mt-2 h-36 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
                <img
                  src={formData.heroImage}
                  alt="Portada"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Galería de Fotografías */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Galería de Fotos del Local ({business.gallery.length} fotos)
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Se muestran en el carrusel de la app de Bukea y en la ficha del comensal.
                  </p>
                </div>
              </div>

              {/* Agregar nueva foto */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Pegar URL de nueva foto (https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Foto</span>
                </button>
              </div>

              {/* Grilla de fotos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {business.gallery.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative group h-28 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100"
                  >
                    <img src={photo} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios de Perfil</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          PESTAÑA 2: HORARIOS & REGLAS OPERATIVAS
          ========================================================================= */}
      {activeTab === 'horarios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Horario de Operación Semanal
            </h3>

            <div className="space-y-3">
              {business.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-neutral-900">{item.days}</span>
                  <span className="text-xs font-medium text-neutral-600 bg-white px-3 py-1 rounded-lg border border-neutral-200">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Tiempo de Tolerancia de Reserva
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formData.toleranceMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, toleranceMinutes: Number(e.target.value) })
                    }
                    className="w-32 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold"
                  />
                  <span className="text-xs text-neutral-500">
                    minutos de gracia antes de liberar mesa
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Capacidad Total de Clientes Simultáneos
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={formData.totalCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCapacity: Number(e.target.value) })
                    }
                    className="w-32 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold"
                  />
                  <span className="text-xs text-neutral-500">personas de aforo máximo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 3: GESTOR DE MENÚ / CARTA DIGITAL (CRUD COMPLETO)
          ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Carta Digital & Menú ({business.dishes.length} platos/servicios)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Agrega, edita precios, reordena la posición en la app y gestiona la disponibilidad en cocina.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openDishModal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Plato</span>
              </button>
            </div>

            {/* Filtro por Categorías */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* LISTA DE PLATOS CON ACCIONES CRUD: MOVE, EDIT, DELETE, TOGGLE */}
            <div className="space-y-3 pt-2">
              {filteredDishes.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  No hay platillos registrados en esta categoría.
                </div>
              ) : (
                filteredDishes.map((dish, index) => (
                  <div
                    key={dish.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      dish.isAvailable
                        ? 'border-neutral-200/80 bg-white hover:border-neutral-300'
                        : 'border-neutral-200 bg-neutral-50/70 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Imagen */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
                        <img
                          src={dish.photo}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-900">{dish.name}</h4>
                          {dish.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.2 rounded">
                              {dish.badge}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.2 rounded">
                            {dish.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{dish.desc}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-bold text-neutral-900">
                            ${dish.priceUSD.toFixed(2)}{' '}
                            <span className="text-[10px] text-neutral-400 font-normal">USD</span>
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            (Aprox. Bs. {(dish.priceUSD * 36.5).toFixed(2)} BCV)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN: REORDER, TOGGLE AVAILABILITY, EDIT, DELETE */}
                    <div className="flex items-center gap-1.5 self-end md:self-center">
                      {/* Subir/Bajar Orden */}
                      <button
                        type="button"
                        onClick={() => reorderDish(dish.id, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderDish(dish.id, 'down')}
                        disabled={index === filteredDishes.length - 1}
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Disponible / Agotado */}
                      <button
                        type="button"
                        onClick={() => toggleDishAvailability(dish.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          dish.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {dish.isAvailable ? 'Disponible' : 'Agotado hoy'}
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => openDishModal(dish)}
                        className="p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-all"
                        title="Editar plato"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar "${dish.name}" de la carta?`)) {
                            deleteDish(dish.id);
                          }
                        }}
                        className="p-2 rounded-lg border border-neutral-200 text-rose-600 hover:bg-rose-50 transition-all"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CREACIÓN / EDICIÓN DE PLATO (ADD / EDIT)
          ========================================================================= */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {editingDish ? 'Editar Plato / Servicio' : 'Agregar Nuevo Plato a la Carta'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Aparecerá en el menú digital interactivo y en el POS de cocina.
                </p>
              </div>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Nombre del Plato / Servicio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tartar de Atún Rojo"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Categoría *
                  </label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Entradas">Entradas</option>
                    <option value="Del mar">Del mar</option>
                    <option value="Parrilla">Parrilla</option>
                    <option value="Postres">Postres</option>
                    <option value="Coctelería & Bar">Coctelería & Bar</option>
                    <option value="Pases & Membresías">Pases & Membresías</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={dishForm.priceUSD}
                    onChange={(e) => setDishForm({ ...dishForm, priceUSD: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Descripción Gastronómica
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Láminas frescas con vinagreta de maracuyá, emulsión de wasabi y crocante de chivo."
                  value={dishForm.desc}
                  onChange={(e) => setDishForm({ ...dishForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Ingredientes Clave (Separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Atún fresco, Ají margariteño, Sésamo negro"
                  value={dishForm.ingredients}
                  onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    Badge Especial (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Chef Special, 2x1 Jueves"
                    value={dishForm.badge}
                    onChange={(e) => setDishForm({ ...dishForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-1">
                    URL de la Fotografía
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={dishForm.photo}
                    onChange={(e) => setDishForm({ ...dishForm, photo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-neutral-950 hover:bg-black text-white rounded-xl shadow-xs"
                >
                  {editingDish ? 'Guardar Cambios' : 'Publicar en Menú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
