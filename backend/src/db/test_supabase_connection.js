import { getSupabase } from './supabase.js';

async function verifySupabase() {
  console.log('🔍 Verificando conexión y tablas canónicas en Supabase...');
  const supabase = getSupabase();

  const tables = ['restaurants', 'tables', 'menu_items', 'guests', 'bookings', 'reviews', 'payments'];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);

      if (error) {
        results[table] = { status: 'PENDIENTE_CREACION', code: error.code, message: error.message };
      } else {
        results[table] = { status: 'ONLINE', count: data.length };
      }
    } catch (e) {
      results[table] = { status: 'EXCEPTION', error: e.message };
    }
  }

  console.table(results);
}

verifySupabase();
