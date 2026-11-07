'use client';

import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Send,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  Sliders,
  Settings,
  X,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';

interface VerifiedReview {
  id: string;
  author: string;
  userTier: string;
  rating: number;
  date: string;
  comment: string;
  dishOrdered: string;
  isVerifiedGuest: boolean;
  reply?: string;
}

const INITIAL_REVIEWS: VerifiedReview[] = [
  {
    id: 'rev-1',
    author: 'Carlos Mendoza',
    userTier: 'Prime',
    rating: 5,
    date: 'Hoy, 14:10',
    comment: 'La langosta al fuego de leña estuvo sencillamente espectacular. La atención en la mesa M-01 fue impecable y el ambiente frente a la bahía inigualable.',
    dishOrdered: 'Langosta al Fuego de Leña',
    isVerifiedGuest: true,
  },
  {
    id: 'rev-2',
    author: 'Sofía Valero',
    userTier: 'VIP Gourmet',
    rating: 5,
    date: 'Ayer',
    comment: 'Las camas balinesas son el mejor plan de Margarita. La coctelería de autor y el servicio del personal siempre al más alto nivel.',
    dishOrdered: 'Tomahawk Steak & Moët Chandon',
    isVerifiedGuest: true,
    reply: '¡Muchísimas gracias por tu visita Sofía! Siempre es un placer absoluto recibirte en tu casa frente al mar.',
  },
  {
    id: 'rev-3',
    author: 'Marcos Polar',
    userTier: 'VIP Gourmet',
    rating: 4.8,
    date: '03 Nov 2026',
    comment: 'Excelente cena corporativa en el salón VIP. La privacidad y la acústica fueron perfectas para nuestra reunión ejecutiva.',
    dishOrdered: 'Menú Degustación 5 Tiempos',
    isVerifiedGuest: true,
  },
];

export default function PartnerReputacionPage() {
  const { business, toggleAiSetting, updateAiSettings } = usePartner();
  const [reviews, setReviews] = useState<VerifiedReview[]>(INITIAL_REVIEWS);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isReviewsAiEnabled = business.aiSettings?.reviewsAutoReply ?? true;
  const currentTone = business.aiSettings?.reviewsTone ?? 'elegante';
  const onlyPositive = business.aiSettings?.onlyPositiveReviewsAutoReply ?? true;

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews(
      reviews.map((r) => (r.id === reviewId ? { ...r, reply: replyText.trim() } : r))
    );
    setReplyingToId(null);
    setReplyText('');
  };

  const generateAiReply = (rev: VerifiedReview) => {
    if (currentTone === 'elegante') {
      return `Estimado/a ${rev.author}, es un verdadero honor haberte recibido en ${business.name}. Nos alegra enormemente que hayas disfrutado de nuestro(a) ${rev.dishOrdered} y de la atención de nuestro equipo. Esperamos recibirte nuevamente muy pronto en tu casa frente al mar.`;
    } else if (currentTone === 'calido') {
      return `¡Hola ${rev.author}! Muchísimas gracias por tus amables palabras y por elegirnos. ¡Nos alegra mucho que ${rev.dishOrdered} haya estado a la altura de tu visita! Te esperamos con los brazos abiertos en tu próxima salida.`;
    } else {
      return `¡Gracias por visitarnos ${rev.author}! Nos encanta saber que la pasaste genial y que disfrutaste ${rev.dishOrdered}. ¡Nos vemos pronto en ${business.name}!`;
    }
  };

  const handleUseAiForReview = (rev: VerifiedReview) => {
    setReplyingToId(rev.id);
    setReplyText(generateAiReply(rev));
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HEADER REPUTACIÓN & TOGGLE IA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Reseñas Verificadas & Reputación
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Escudo Anti-Trolls
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Solo pueden calificar comensales reales que completaron su reserva o pagaron su cuenta a través de Bukea-Pay.
          </p>
        </div>

        {/* TOGGLE Y AJUSTE DE RESPUESTAS CON IA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-all"
            title="Configurar tono y reglas de la IA"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleAiSetting('reviewsAutoReply')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              isReviewsAiEnabled
                ? 'bg-neutral-900 hover:bg-black text-white border-neutral-900 shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isReviewsAiEnabled ? 'text-amber-300' : 'text-neutral-500'}`} />
            <span>{isReviewsAiEnabled ? 'IA Reseñas: ON' : 'IA Reseñas: OFF'}</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE SCORE NPS Y CALIFICACIONES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
            Calificación Global
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-950">4.9</span>
            <div className="flex text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Basado en 128 comensales reales</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
            Gastronomía
          </span>
          <span className="text-2xl font-bold text-neutral-950">4.9 / 5.0</span>
          <p className="text-[11px] text-neutral-400 mt-1">Frescura de mariscos y carnes</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
            Servicio & Atención
          </span>
          <span className="text-2xl font-bold text-neutral-950">4.8 / 5.0</span>
          <p className="text-[11px] text-neutral-400 mt-1">Rapidez y cordialidad de mesoneros</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
            Ambiente & Vista
          </span>
          <span className="text-2xl font-bold text-neutral-950">5.0 / 5.0</span>
          <p className="text-[11px] text-neutral-400 mt-1">Música lounge y puesta de sol</p>
        </div>
      </div>

      {/* FEED DE RESEÑAS */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-neutral-900">
          Últimas Evaluaciones Verificadas
        </h3>

        <div className="divide-y divide-neutral-100 space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900">{rev.author}</span>
                    <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded">
                      {rev.userTier}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Comensal Verificado</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>

              <div className="text-[11px] text-neutral-400">
                Plato consumido: <span className="font-semibold text-neutral-700">{rev.dishOrdered}</span>
              </div>

              {/* Respuesta oficial existente */}
              {rev.reply && (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                  <span className="font-bold text-neutral-900 block text-[11px]">
                    Respuesta Oficial de {business.name}:
                  </span>
                  <p className="text-neutral-600">{rev.reply}</p>
                </div>
              )}

              {/* Formulario para responder o generar con IA */}
              {!rev.reply && (
                <div>
                  {replyingToId === rev.id ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Respuesta Oficial:</span>
                        <button
                          type="button"
                          onClick={() => setReplyText(generateAiReply(rev))}
                          className="inline-flex items-center gap-1 text-neutral-900 hover:text-black font-semibold"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Regenerar con IA ({currentTone})</span>
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Escribe una respuesta cordial en nombre del establecimiento..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-neutral-50/50 leading-relaxed"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className="px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(rev.id)}
                          className="px-3.5 py-1 text-xs font-bold bg-neutral-900 hover:bg-black text-white rounded-lg shadow-xs"
                        >
                          Publicar Respuesta
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUseAiForReview(rev)}
                        className="text-xs font-bold text-neutral-900 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Generar Respuesta con IA</span>
                      </button>

                      <button
                        onClick={() => {
                          setReplyingToId(rev.id);
                          setReplyText('');
                        }}
                        className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-neutral-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Manual</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CONFIGURACIÓN DE IA DE RESEÑAS */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-neutral-900">IA de Reseñas</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Tono de Comunicación de la IA:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'elegante', label: 'Elegante' },
                    { id: 'calido', label: 'Cálido' },
                    { id: 'casual', label: 'Casual' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateAiSettings({ reviewsTone: t.id as any })}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                        currentTone === t.id
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  La IA adaptará el vocabulario y cortesía al responder a los comensales.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyPositive}
                    onChange={(e) =>
                      updateAiSettings({ onlyPositiveReviewsAutoReply: e.target.checked })
                    }
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Protección Anti-Crisis (4 y 5 estrellas)
                    </span>
                    <p className="text-[10px] text-neutral-500 leading-tight">
                      Sólo auto-generar para comensales satisfechos. Las calificaciones de 1 a 3 estrellas requerirán redacción humana manual.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-xl shadow-xs"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
