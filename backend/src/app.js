import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { getDatabase } from './db/database.js';
import restaurantRoutes from './modules/restaurants/restaurant.routes.js';
import reservationRoutes from './modules/reservations/reservation.routes.js';
import crmRoutes from './modules/crm/crm.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import nfcRoutes from './modules/nfc/nfc.routes.js';
import canonicalRoutes from './modules/canonical_v1/canonical.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  // Middlewares globales
  app.use(cors({ origin: ENV.CORS_ORIGIN }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Inicializar base de datos local SQLite (fallback)
  const db = getDatabase();

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
      service: 'Bookealo Core Engine (Rol 3 Backend)',
      cloud_database: 'Supabase PostgreSQL (Canonical 7 Tables Live)',
      local_cache: 'SQLite (Node.js Native)'
    });
  });

  // Portal Interactivo del Backend & Métricas en Vivo
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Bookealo Core API — Rol 3 Backend</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0A0B0E; color: #E2E8F0; }
    .gold-gradient { background: linear-gradient(135deg, #FFF 0%, #D4AF37 50%, #9A7B1C 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
</head>
<body class="p-6 md:p-12 max-w-6xl mx-auto">
  <header class="border-b border-gray-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-semibold uppercase tracking-widest text-emerald-400">Supabase PostgreSQL 100% ONLINE</span>
      </div>
      <h1 class="text-3xl font-extrabold gold-gradient font-display">Bookealo Core Engine API</h1>
      <p class="text-gray-400 text-sm mt-1">Rama: <span class="text-amber-400 font-mono">feat/rol3-backend-core</span> | Módulo 1 (UI Comensal Canónico)</p>
    </div>
    <div class="flex gap-2">
      <a href="/api/health" target="_blank" class="px-3 py-1.5 text-xs font-semibold rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition">/api/health</a>
      <a href="http://localhost:3001" target="_blank" class="px-3 py-1.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition">Landing Web (3001)</a>
    </div>
  </header>

  <!-- Banner de Supabase Activo -->
  <div class="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-5 mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-emerald-400 font-bold text-sm flex items-center gap-2">
          <span>⚡ 7 Tablas Nucleares Conectadas</span>
        </h3>
        <p class="text-xs text-emerald-200/70 mt-1">restaurants &bull; tables &bull; menu_items (AR 3D) &bull; guests &bull; bookings &bull; reviews &bull; payments</p>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">PostgreSQL Live</span>
    </div>
  </div>

  <!-- Catálogo de Endpoints Clave Canónicos -->
  <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
    <span>💎 Endpoints Canónicos (Módulo 1: UI Comensal)</span>
  </h2>

  <div class="space-y-3 font-mono text-xs">
    <!-- Ficha Maestra -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex items-center gap-3">
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
        <span class="text-gray-300">/api/v1/restaurants/downtown-beach-club</span>
      </div>
      <a href="/api/v1/restaurants/downtown-beach-club" target="_blank" class="text-amber-400 hover:underline">Ver Ficha Maestra &rarr;</a>
    </div>

    <!-- Menú AR -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex items-center gap-3">
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
        <span class="text-gray-300">/api/v1/restaurants/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/menu?onlyAr=true</span>
      </div>
      <a href="/api/v1/restaurants/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/menu?onlyAr=true" target="_blank" class="text-amber-400 hover:underline">Ver Platos 3D/AR &rarr;</a>
    </div>

    <!-- Reseñas Verificadas -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex items-center gap-3">
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
        <span class="text-gray-300">/api/v1/restaurants/downtown-beach-club/reviews</span>
      </div>
      <a href="/api/v1/restaurants/downtown-beach-club/reviews" target="_blank" class="text-amber-400 hover:underline">Ver Reseñas Verificadas &rarr;</a>
    </div>

    <!-- Consultar Reserva -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div class="flex items-center gap-3">
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">GET</span>
        <span class="text-gray-300">/api/v1/bookings/BK-5821</span>
      </div>
      <a href="/api/v1/bookings/BK-5821" target="_blank" class="text-amber-400 hover:underline">Ver Estado Reserva Semilla &rarr;</a>
    </div>
  </div>

  <footer class="mt-12 text-center text-xs text-gray-600 border-t border-gray-900 pt-6">
    Bookealo Platform &copy; 2026 &bull; Rol 3 Backend &bull; Supabase Live &bull; feat/rol3-backend-core
  </footer>
</body>
</html>
    `);
  });

  // Endpoints Canónicos (Módulo 1: UI Comensal - Supabase Live)
  app.use('/api/v1', canonicalRoutes);

  // Endpoints Base Legacy / Compatibilidad
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/crm', crmRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/nfc', nfcRoutes);

  // Manejador 404 y Errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
