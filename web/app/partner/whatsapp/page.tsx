'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  Phone,
  CheckCheck,
  Sparkles,
  Clock,
  MapPin,
  Utensils,
  Search,
} from 'lucide-react';
import { usePartner } from '../PartnerContext';

interface ChatConversation {
  id: string;
  guestName: string;
  phone: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  botEnabled: boolean;
  messages: {
    sender: 'user' | 'bot' | 'human';
    text: string;
    time: string;
  }[];
}

const INITIAL_CHATS: ChatConversation[] = [
  {
    id: 'chat-1',
    guestName: 'Carlos Mendoza',
    phone: '+58 412 1234567',
    lastMessage: 'Perfecto, ya vamos saliendo en camino.',
    time: '13:42',
    unreadCount: 0,
    botEnabled: true,
    messages: [
      { sender: 'bot', text: '¡Hola Carlos! Tu reserva para hoy a las 13:30 en Downtown Beach Club está garantizada. Te esperamos en Mesa M-01.', time: '12:00' },
      { sender: 'user', text: '¿Tienen la carta disponible para ir revisando?', time: '12:05' },
      { sender: 'bot', text: '¡Por supuesto! Puedes ver nuestro Menú Digital interactivo con fotos en alta resolución aquí: https://bukea.app/lugar/downtown-beach-club/menu', time: '12:05' },
      { sender: 'user', text: 'Perfecto, ya vamos saliendo en camino.', time: '13:42' },
    ],
  },
  {
    id: 'chat-2',
    guestName: 'Elena Rivas',
    phone: '+58 414 7654321',
    lastMessage: '¿Tienen valet parking?',
    time: '13:20',
    unreadCount: 1,
    botEnabled: false,
    messages: [
      { sender: 'bot', text: 'Hola Elena, confirmamos tu llegada estimada a las 14:00 hrs.', time: '13:00' },
      { sender: 'user', text: '¿Tienen valet parking?', time: '13:20' },
    ],
  },
  {
    id: 'chat-3',
    guestName: 'Rodrigo Paez',
    phone: '+58 424 9988776',
    lastMessage: 'Listo, nos vemos a las 15:00 en la cama balinesa.',
    time: '11:15',
    unreadCount: 0,
    botEnabled: true,
    messages: [
      { sender: 'bot', text: 'Hola Rodrigo, tu cama balinesa BAL-02 está reservada para hoy a las 15:00 hrs.', time: '11:00' },
      { sender: 'user', text: 'Listo, nos vemos a las 15:00 en la cama balinesa.', time: '11:15' },
    ],
  },
];

export default function PartnerWhatsAppPage() {
  const { business, toggleAiSetting } = usePartner();
  const [chats, setChats] = useState<ChatConversation[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [inputText, setInputText] = useState('');

  const isGlobalAiEnabled = business.aiSettings?.whatsappAutoReply ?? true;

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const newMessage = {
      sender: 'human' as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: newMessage.text,
              time: newMessage.time,
              messages: [...c.messages, newMessage],
            }
          : c
      )
    );
    setInputText('');
  };

  const toggleBot = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, botEnabled: !c.botEnabled } : c))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* HEADER WHATSAPP & TOGGLE IA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Central WhatsApp & Chatbot Integrado
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              WhatsApp Cloud API
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Bandeja unificada con respuestas automáticas de Bukea Bot para menús, ubicación y reservas, con control de handoff a operador humano.
          </p>
        </div>

        {/* TOGGLE GLOBAL IA AUTO-RESPONDER */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-neutral-900 block">
              Auto-Responder IA
            </span>
            <span className="text-[10px] text-neutral-400">
              {isGlobalAiEnabled ? 'Responde menús, reservas y FAQs' : 'Pausado (Atención humana)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleAiSetting('whatsappAutoReply')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              isGlobalAiEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
            }`}
          >
            <Bot className={`w-4 h-4 ${isGlobalAiEnabled ? 'text-white' : 'text-neutral-500'}`} />
            <span>{isGlobalAiEnabled ? 'IA WhatsApp: ON' : 'IA WhatsApp: OFF'}</span>
          </button>
        </div>
      </div>

      {/* BANNER INFORMATIVO SI LA IA ESTÁ DESACTIVADA */}
      {!isGlobalAiEnabled && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Modo Manual Activo:</strong> La IA de WhatsApp está desactivada. Todos los mensajes entrantes deben ser respondidos manualmente por tu equipo de recepción.
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleAiSetting('whatsappAutoReply', true)}
            className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 shrink-0"
          >
            Reactivar IA
          </button>
        </div>
      )}

      {/* BANDEJA TIPO WHATSAPP */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
        {/* LISTA DE CONVERSACIONES */}
        <div className="border-r border-neutral-200 flex flex-col">
          <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="divide-y divide-neutral-100 flex-1 overflow-y-auto">
            {chats.map((chat) => {
              const isSelected = chat.id === activeChat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected ? 'bg-neutral-100/80' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-xs text-neutral-900">{chat.guestName}</span>
                    <span className="text-[10px] text-neutral-400">{chat.time}</span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-1">{chat.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-neutral-400">{chat.phone}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        chat.botEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {chat.botEnabled ? 'Bot Activo' : 'Manual'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ÁREA DE CHAT ACTIVO */}
        <div className="md:col-span-2 flex flex-col justify-between bg-[#FBFBFA]">
          {/* Header del Chat */}
          <div className="p-4 bg-white border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-900">{activeChat.guestName}</h3>
              <p className="text-xs text-neutral-400">{activeChat.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBot(activeChat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  activeChat.botEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{activeChat.botEnabled ? 'Bot Encendido' : 'Bot Pausado'}</span>
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {activeChat.messages.map((msg, i) => {
              const isMe = msg.sender === 'bot' || msg.sender === 'human';
              return (
                <div
                  key={i}
                  className={`flex flex-col max-w-[80%] ${
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-white text-neutral-900 border border-neutral-200'
                        : msg.sender === 'bot'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1">
                    <span>
                      {msg.sender === 'bot'
                        ? 'Bot Automatizado'
                        : msg.sender === 'human'
                        ? 'Operador'
                        : activeChat.guestName}
                    </span>
                    <span>·</span>
                    <span>{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input de Respuesta Humana */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe una respuesta como operador humano..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              className="p-2 bg-neutral-900 hover:bg-black text-white rounded-xl shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
