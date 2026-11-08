'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  Flame,
  ChefHat,
  Receipt,
  Layers,
  Search,
  Coins,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';
import { useBcv } from '@/app/context/BcvContext';

interface OrderItem {
  dishId: string;
  name: string;
  priceUSD: number;
  qty: number;
  notes?: string;
}

interface TableOrder {
  id: string;
  tableNumber: string;
  server: string;
  items: OrderItem[];
  status: 'pendiente' | 'en_cocina' | 'listo' | 'entregado';
  createdAt: string;
  elapsedMinutes: number;
}

const INITIAL_ORDERS: TableOrder[] = [
  {
    id: 'ord-101',
    tableNumber: 'M-01',
    server: 'Alejandro G.',
    items: [
      { dishId: 'd-1', name: 'Langosta al Fuego de Leña', priceUSD: 38, qty: 2, notes: 'Mantequilla extra' },
      { dishId: 'd-2', name: 'Ceviche Mixto Insular', priceUSD: 16, qty: 1, notes: 'Sin picante' },
    ],
    status: 'en_cocina',
    createdAt: '13:42',
    elapsedMinutes: 14,
  },
  {
    id: 'ord-102',
    tableNumber: 'BAL-01',
    server: 'Valentina P.',
    items: [
      { dishId: 'd-3', name: 'Tomahawk Steak Angus 800g', priceUSD: 52, qty: 1, notes: 'Término medio' },
      { dishId: 'd-4', name: 'Risotto de Mariscos & Azafrán', priceUSD: 22, qty: 2 },
    ],
    status: 'pendiente',
    createdAt: '13:50',
    elapsedMinutes: 6,
  },
  {
    id: 'ord-103',
    tableNumber: 'VIP-B',
    server: 'Marcos R.',
    items: [
      { dishId: 'd-5', name: 'Tarta Tibia de Chocolate', priceUSD: 10, qty: 4 },
    ],
    status: 'listo',
    createdAt: '13:30',
    elapsedMinutes: 26,
  },
];

export default function PartnerPOSPage() {
  const { business } = usePartner();
  const { bcvRate, toBs } = useBcv();

  const [activeTab, setActiveTab] = useState<'kds' | 'comanda' | 'inventario'>('kds');
  const [orders, setOrders] = useState<TableOrder[]>(INITIAL_ORDERS);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState('M-02');
  const [currentCart, setCurrentCart] = useState<OrderItem[]>([]);
  const [printTicketOrder, setPrintTicketOrder] = useState<TableOrder | null>(null);

  // Avanzar estado de orden en KDS
  const advanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextStatus =
            o.status === 'pendiente'
              ? 'en_cocina'
              : o.status === 'en_cocina'
              ? 'listo'
              : 'entregado';
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  // Agregar ítem al carrito de nueva comanda
  const addItemToCart = (dish: any) => {
    setCurrentCart((prev) => {
      const existing = prev.find((item) => item.dishId === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { dishId: dish.id, name: dish.name, priceUSD: dish.priceUSD, qty: 1 }];
    });
  };

  // Enviar comanda a cocina
  const handleSendToKitchen = () => {
    if (currentCart.length === 0) return;
    const newOrder: TableOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      tableNumber: selectedTableForOrder,
      server: 'Mesonero Salón',
      items: currentCart,
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
    };
    setOrders([newOrder, ...orders]);
    setCurrentCart([]);
    setActiveTab('kds');
  };

  const cartTotalUSD = currentCart.reduce((sum, item) => sum + item.priceUSD * item.qty, 0);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HEADER POS & KDS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              POS All-in-One & Pantalla de Cocina (KDS)
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
              Kamra Core
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Toma de órdenes en salón, control de tiempos en cocina/barra e impresión de comandas térmicas.
          </p>
        </div>

        {/* TABS POS */}
        <div className="flex items-center gap-2">
          {[
            { id: 'kds', label: 'Pantalla Cocina (KDS)', icon: ChefHat },
            { id: 'comanda', label: 'Nueva Comanda', icon: UtensilsCrossed },
            { id: 'inventario', label: 'Stock Crítico', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
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
      </div>

      {/* =========================================================================
          TAB 1: KITCHEN DISPLAY SYSTEM (KDS KANBAN)
          ========================================================================= */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 bg-white p-3 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>KDS en Vivo · Tiempo promedio de preparación: 18 min</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-600 font-semibold">
                {orders.filter((o) => o.status !== 'entregado').length} comandas activas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Columna 1: Pendiente en Cocina */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Pendientes ({orders.filter((o) => o.status === 'pendiente').length})
                </span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>

              {orders
                .filter((o) => o.status === 'pendiente')
                .map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-900">{ord.tableNumber}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        +{ord.elapsedMinutes}m
                      </span>
                    </div>

                    <div className="divide-y divide-amber-200/50 text-xs">
                      {ord.items.map((item, i) => (
                        <div key={i} className="py-1.5 flex justify-between">
                          <span className="font-semibold text-neutral-900">
                            {item.qty}x {item.name}
                          </span>
                          {item.notes && (
                            <span className="text-[10px] text-amber-700 italic">{item.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                      <button
                        onClick={() => setPrintTicketOrder(ord)}
                        className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </button>
                      <button
                        onClick={() => advanceOrderStatus(ord.id)}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                      >
                        Iniciar Preparación
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Columna 2: En Preparación */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-900">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  En Fuego / Cocina ({orders.filter((o) => o.status === 'en_cocina').length})
                </span>
                <Flame className="w-3.5 h-3.5 text-neutral-900" />
              </div>

              {orders
                .filter((o) => o.status === 'en_cocina')
                .map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-900">{ord.tableNumber}</span>
                      <span className="text-[10px] font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                        +{ord.elapsedMinutes}m
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-100 text-xs">
                      {ord.items.map((item, i) => (
                        <div key={i} className="py-1.5 flex justify-between">
                          <span className="font-semibold text-neutral-900">
                            {item.qty}x {item.name}
                          </span>
                          {item.notes && (
                            <span className="text-[10px] text-neutral-500 italic">{item.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => setPrintTicketOrder(ord)}
                        className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </button>
                      <button
                        onClick={() => advanceOrderStatus(ord.id)}
                        className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-xs"
                      >
                        Marcar Listo
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Columna 3: Listo para Servir */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Listos para Servir ({orders.filter((o) => o.status === 'listo').length})
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>

              {orders
                .filter((o) => o.status === 'listo')
                .map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-neutral-900">{ord.tableNumber}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Listo
                      </span>
                    </div>

                    <div className="divide-y divide-emerald-200/50 text-xs">
                      {ord.items.map((item, i) => (
                        <div key={i} className="py-1.5 flex justify-between">
                          <span className="font-semibold text-neutral-900">
                            {item.qty}x {item.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                      <span className="text-[11px] text-neutral-500">Mesonero notificado</span>
                      <button
                        onClick={() => advanceOrderStatus(ord.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                      >
                        Entregar a Mesa
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: NUEVA COMANDA (COMANDERO DIGITAL)
          ========================================================================= */}
      {activeTab === 'comanda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menú de selección rápida */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Selecciona platillos para la orden
              </span>
              <span className="text-xs text-neutral-400">
                {business.dishes.length} platillos disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {business.dishes
                .filter((d) => d.isAvailable)
                .map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => addItemToCart(dish)}
                    className="p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{dish.name}</h4>
                      <p className="text-[11px] text-neutral-400">{dish.category}</p>
                      <p className="text-xs font-bold text-neutral-900 mt-1">
                        ${dish.priceUSD.toFixed(2)} USD <span className="text-[10px] text-neutral-500 font-normal">· {toBs(dish.priceUSD)}</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Resumen de Comanda Actual */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Comanda en Curso</h3>
                <p className="text-xs text-neutral-400">Mesa asignada:</p>
              </div>
              <select
                value={selectedTableForOrder}
                onChange={(e) => setSelectedTableForOrder(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50"
              >
                {business.tables.map((t) => (
                  <option key={t.id} value={t.number}>
                    {t.number} ({t.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Ítems en carrito */}
            <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto">
              {currentCart.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs">
                  Añade platillos desde el menú de la izquierda.
                </div>
              ) : (
                currentCart.map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-900">{item.name}</span>
                      <p className="text-[11px] text-neutral-400">
                        ${item.priceUSD} x {item.qty} = ${(item.priceUSD * item.qty).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentCart(
                            currentCart
                              .map((it) => (it.dishId === item.dishId ? { ...it, qty: it.qty - 1 } : it))
                              .filter((it) => it.qty > 0)
                          )
                        }
                        className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-neutral-900">{item.qty}</span>
                      <button
                        onClick={() =>
                          setCurrentCart(
                            currentCart.map((it) =>
                              it.dishId === item.dishId ? { ...it, qty: it.qty + 1 } : it
                            )
                          )
                        }
                        className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total & Enviar */}
            <div className="pt-3 border-t border-neutral-100 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-bold text-neutral-900">
                  <span>Total Estimado:</span>
                  <span>${cartTotalUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-neutral-500">
                  <span>Total en Bolívares (BCV):</span>
                  <span className="font-mono text-neutral-900">{toBs(cartTotalUSD)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={currentCart.length === 0}
                onClick={handleSendToKitchen}
                className="w-full py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40"
              >
                Enviar Comanda a Cocina (KDS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STOCK CRÍTICO & RECETAS
          ========================================================================= */}
      {activeTab === 'inventario' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Control de Insumos Críticos
              </h3>
              <p className="text-xs text-neutral-400">
                Deducción automática por cada plato ordenado en el POS de Bukea.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Langosta Fresca de Pampatar', stock: '8 unidades', status: 'critical', alert: 'Bajo stock (Reponer)' },
              { name: 'Tomahawk Angus Prime', stock: '14 cortes', status: 'ok', alert: 'Stock adecuado' },
              { name: 'Mero Margariteño', stock: '12 kg', status: 'ok', alert: 'Stock adecuado' },
              { name: 'Ron Carúpano Reserva', stock: '6 botellas', status: 'warning', alert: 'Alerta consumo rápido' },
              { name: 'Ají Dulce Margariteño', stock: '5 kg', status: 'ok', alert: 'Stock adecuado' },
            ].map((insumo, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                <span className="text-xs font-bold text-neutral-900">{insumo.name}</span>
                <p className="text-sm font-extrabold text-neutral-950">{insumo.stock}</p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                    insumo.status === 'critical'
                      ? 'bg-rose-100 text-rose-800'
                      : insumo.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {insumo.alert}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TICKET TÉRMICO PARA IMPRESIÓN */}
      {printTicketOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-xl border border-neutral-200 font-mono text-xs">
            <div className="text-center pb-3 border-b border-dashed border-neutral-300">
              <h3 className="font-bold text-sm tracking-widest">{business.name.toUpperCase()}</h3>
              <p className="text-[10px] text-neutral-500">COMANDA DE SALÓN</p>
              <p className="text-[10px] text-neutral-400 mt-1">Mesa: {printTicketOrder.tableNumber}</p>
              <p className="text-[10px] text-neutral-400">Hora: {printTicketOrder.createdAt}</p>
            </div>

            <div className="my-4 divide-y divide-dashed divide-neutral-200">
              {printTicketOrder.items.map((it, i) => (
                <div key={i} className="py-1.5 flex justify-between">
                  <span>
                    {it.qty}x {it.name}
                  </span>
                  <span>${(it.priceUSD * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1 font-bold text-neutral-900">
              <div className="flex justify-between">
                <span>TOTAL USD:</span>
                <span>
                  $
                  {printTicketOrder.items
                    .reduce((acc, it) => acc + it.priceUSD * it.qty, 0)
                    .toFixed(2)}{' '}
                  USD
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-700">
                <span>TOTAL BCV:</span>
                <span>
                  {toBs(printTicketOrder.items.reduce((acc, it) => acc + it.priceUSD * it.qty, 0))}
                </span>
              </div>
              <div className="text-[9px] text-neutral-400 font-normal text-right">
                Tasa oficial BCV: Bs. {bcvRate.toFixed(2)}
              </div>
            </div>

            <div className="mt-4 pt-3 text-center border-t border-neutral-200">
              <p className="text-[10px] text-neutral-400">Escanea para pagar en mesa con Bukea-Pay</p>
              <div className="w-16 h-16 bg-neutral-100 border border-neutral-300 rounded-lg mx-auto my-2 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-neutral-700" />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPrintTicketOrder(null)}
                className="flex-1 py-1.5 text-center rounded-lg border border-neutral-200 font-sans text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert('Comanda enviada a impresora térmica de cocina.');
                  setPrintTicketOrder(null);
                }}
                className="flex-1 py-1.5 text-center rounded-lg bg-neutral-900 text-white font-sans text-xs font-bold"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
