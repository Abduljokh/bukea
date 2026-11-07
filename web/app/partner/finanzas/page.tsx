'use client';

import React, { useState } from 'react';
import {
  Coins,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Send,
  MessageCircle,
  Users,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';

export default function PartnerFinanzasPage() {
  const { business } = usePartner();

  const [activeTab, setActiveTab] = useState<'puntos' | 'orquestador' | 'split'>('puntos');

  // Estado del Orquestador de Enlace de Pago
  const [linkMonto, setLinkMonto] = useState('45.00');
  const [linkConcepto, setLinkConcepto] = useState('Consumo Mesa M-01');
  const [linkGuestPhone, setLinkGuestPhone] = useState('04121234567');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Estado de Split Bill
  const [splitTotal, setSplitTotal] = useState(120);
  const [splitPersons, setSplitPersons] = useState(4);
  const [splitCustomTip, setSplitCustomTip] = useState(10); // % de propina sugerida

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const linkId = `pay-${Math.random().toString(36).substring(2, 8)}`;
    const url = `https://bukea.app/pay/${linkId}?amt=${linkMonto}&b=${business.id}`;
    setGeneratedLink(url);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Cálculo Split Bill
  const totalWithTip = splitTotal * (1 + splitCustomTip / 100);
  const perPerson = totalWithTip / Math.max(1, splitPersons);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HEADER FINANZAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Finanzas, Bukea-Pay & Puntos Bukea
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Conciliación de puntos usados por comensales, orquestador de links de cobro y división de cuenta (Split Bill).
          </p>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex items-center gap-2">
          {[
            { id: 'puntos', label: 'Puntos Bukea por Cobrar', icon: ShieldCheck },
            { id: 'orquestador', label: 'Orquestador de Pagos', icon: CreditCard },
            { id: 'split', label: 'Split Bill (Mesas)', icon: Users },
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
          TAB 1: CONCILIACIÓN DE PUNTOS BUKEA (FONDO REEMBOLSABLE)
          ========================================================================= */}
      {activeTab === 'puntos' && (
        <div className="space-y-6">
          {/* Card Principal: Saldo Adeudado por Bukea */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Saldo Acumulado en Puntos Canjeados
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold tracking-tight">
                    ${business.bukeaPointsDebtUSD.toFixed(2)}
                  </span>
                  <span className="text-sm text-neutral-400 font-medium">USD</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                  Los comensales canjearon puntos Bukea en su cuenta en tu local. Bukea te reembolsa el 100% de este saldo a tu cuenta bancaria sin comisiones.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-neutral-300">
                Próxima fecha de corte programada: Este Viernes, 18:00 hrs.
              </span>
              <button
                onClick={() => alert(`Solicitud de liquidación por $${business.bukeaPointsDebtUSD.toFixed(2)} USD enviada al departamento de tesorería de Bukea.`)}
                className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Solicitar Liquidación Inmediata
              </button>
            </div>
          </div>

          {/* Historial de Puntos Redimidos */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Desglose de Puntos Redimidos en {business.name}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Comensal</th>
                    <th className="py-3 px-3">Concepto</th>
                    <th className="py-3 px-3">Puntos Canjeados</th>
                    <th className="py-3 px-3">Monto Acreditado</th>
                    <th className="py-3 px-3 text-right">Estado Liquidación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    { fecha: 'Hoy, 13:45', comensal: 'Carlos Mendoza (Prime)', concepto: 'Descuento en Factura Mesa M-01', puntos: '40 pts', usd: '$40.00', status: 'Por Liquidar' },
                    { fecha: 'Hoy, 12:30', comensal: 'Elena Rivas (Foodie)', concepto: 'Abono de Reserva Anti-Spam', puntos: '1 pto', usd: '$1.00', status: 'Por Liquidar' },
                    { fecha: 'Ayer, 21:10', comensal: 'Sofía Valero (VIP Gourmet)', concepto: 'Canje Cóctel de Bienvenida', puntos: '15 pts', usd: '$15.00', status: 'Por Liquidar' },
                    { fecha: '04 Nov 2026', comensal: 'Marcos Polar', concepto: 'Cena Corporativa Salón VIP', puntos: '120 pts', usd: '$120.00', status: 'Liquidado' },
                    { fecha: '02 Nov 2026', comensal: 'Valentina Rossi', concepto: 'Consumo Carta Abierta', puntos: '50 pts', usd: '$50.00', status: 'Liquidado' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-3 font-semibold text-neutral-900">{row.fecha}</td>
                      <td className="py-3 px-3 text-neutral-800 font-medium">{row.comensal}</td>
                      <td className="py-3 px-3 text-neutral-500">{row.concepto}</td>
                      <td className="py-3 px-3 font-bold text-neutral-900">{row.puntos}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{row.usd}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.status === 'Liquidado'
                              ? 'bg-neutral-100 text-neutral-700'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ORQUESTADOR DE PAGOS (LINKS DE COBRO & VENTAS BUKEA-PAY)
          ========================================================================= */}
      {activeTab === 'orquestador' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generador de Links de Pago */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Generar Link de Cobro Bukea-Pay
            </h3>
            <p className="text-xs text-neutral-400">
              Crea un enlace para que el comensal pague desde su mesa con C2P, Pago Móvil, Binance Pay o Tarjeta.
            </p>

            <form onSubmit={handleGenerateLink} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Monto a Cobrar ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={linkMonto}
                  onChange={(e) => setLinkMonto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Concepto / Detalle
                </label>
                <input
                  type="text"
                  value={linkConcepto}
                  onChange={(e) => setLinkConcepto(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  WhatsApp del Comensal (Opcional)
                </label>
                <input
                  type="tel"
                  value={linkGuestPhone}
                  onChange={(e) => setLinkGuestPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                Generar Enlace de Cobro
              </button>
            </form>

            {generatedLink && (
              <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 animate-in fade-in duration-150">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Enlace Listo para Compartir
                </span>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-mono select-all truncate"
                />
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <a
                    href={`https://wa.me/${linkGuestPhone.replace(/[^0-9]/g, '')}?text=Hola,%20aquí%20tienes%20tu%20enlace%20de%20pago%20seguro%20de%20${encodeURIComponent(business.name)}:%20${encodeURIComponent(generatedLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Monitor de Cobros en Vivo */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Ventas Cobradas Vía Bukea-Pay
                </h3>
                <p className="text-xs text-neutral-400">
                  Total cobrado hoy: <span className="font-bold text-neutral-900">$840.00 USD</span>
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Pasarela Activa 100%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Mesa / Concepto</th>
                    <th className="py-2.5 px-3">Método</th>
                    <th className="py-2.5 px-3">Monto</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    { hora: '13:52', concepto: 'Mesa M-01', metodo: 'C2P Automático (Banesco)', monto: '$76.00', status: 'Aprobado' },
                    { hora: '13:15', concepto: 'Camas Balinesas BAL-01', metodo: 'Binance Pay (USDT)', monto: '$140.00', status: 'Aprobado' },
                    { hora: '12:40', concepto: 'Mesa M-03', metodo: 'Pago Móvil Mercantil', monto: '$38.50', status: 'Aprobado' },
                    { hora: '11:55', concepto: 'Barra Coctelera', metodo: 'Stripe (Visa Internacional)', monto: '$28.00', status: 'Aprobado' },
                  ].map((trx, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-3 font-semibold text-neutral-900">{trx.hora}</td>
                      <td className="py-3 px-3 text-neutral-800 font-medium">{trx.concepto}</td>
                      <td className="py-3 px-3 text-neutral-500">{trx.metodo}</td>
                      <td className="py-3 px-3 font-bold text-neutral-900">{trx.monto}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SPLIT BILL (DIVISIÓN DE CUENTA EN MESA)
          ========================================================================= */}
      {activeTab === 'split' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Herramienta de División de Cuenta (Split Bill)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Facilita a grupos de comensales pagar su parte exacta mediante códigos QR o enlaces directos de Bukea-Pay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Total de la Cuenta ($ USD)
              </label>
              <input
                type="number"
                value={splitTotal}
                onChange={(e) => setSplitTotal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Número de Personas
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={splitPersons}
                onChange={(e) => setSplitPersons(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Propina Sugerida (%)
              </label>
              <select
                value={splitCustomTip}
                onChange={(e) => setSplitCustomTip(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
              >
                <option value="0">0% (Sin propina)</option>
                <option value="10">10% Sugerida</option>
                <option value="15">15% Excelente servicio</option>
              </select>
            </div>
          </div>

          {/* Resultado de División */}
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Monto por Comensal:</span>
              <span className="text-2xl font-black text-neutral-950">
                ${perPerson.toFixed(2)} USD
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Incluye ${((splitTotal * splitCustomTip) / 100).toFixed(2)} USD de propina distribuida equitativamente entre los {splitPersons} comensales.
            </p>

            <div className="pt-3 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => alert(`Generados ${splitPersons} sub-enlaces de cobro por $${perPerson.toFixed(2)} USD cada uno.`)}
                className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                Generar {splitPersons} QRs Individuales para la Mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
