import crypto from 'node:crypto';
import { getSupabase } from '../../db/supabase.js';

function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export class CanonicalService {
  /**
   * 1. Ficha Maestra del Local (Lectura ultrarrápida para UI Comensal)
   * Devuelve cabecera, fotos, beneficios, horarios y platos destacados en AR.
   */
  static async getRestaurantMaster(slugOrId) {
    const supabase = getSupabase();

    let query = supabase.from('restaurants').select('*');
    if (isUUID(slugOrId)) {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { data: restaurant, error: restError } = await query.single();
    if (restError || !restaurant) {
      const err = new Error(`Restaurante '${slugOrId}' no encontrado`);
      err.statusCode = 404;
      throw err;
    }

    // Query featured AR menu items
    const { data: featuredMenu } = await supabase
      .from('menu_items')
      .select('id, name, description, category, price_usd, photo_url, model_3d_url, is_featured_ar')
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true)
      .eq('is_featured_ar', true)
      .limit(4);

    // Query available zones
    const { data: tables } = await supabase
      .from('tables')
      .select('zone, capacity_min, capacity_max')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true);

    const zones = Array.from(new Set((tables || []).map(t => t.zone)));

    // Query latest verified reviews
    const { data: latestReviews } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, guests(name)')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })
      .limit(3);

    return {
      id: restaurant.id,
      slug: restaurant.slug,
      name: restaurant.name,
      tagline: restaurant.tagline,
      description: restaurant.description,
      address: restaurant.address,
      coordinates: {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      },
      google_place_id: restaurant.google_place_id,
      rating: restaurant.rating,
      reviews_count: restaurant.reviews_count,
      is_bukea_selection: restaurant.is_bukea_selection,
      tags: restaurant.tags,
      perks: restaurant.perks,
      media: restaurant.media,
      hours: restaurant.hours,
      phone_whatsapp: restaurant.phone_whatsapp,
      deposit_usd: restaurant.deposit_usd,
      zones,
      featured_ar_dishes: featuredMenu || [],
      latest_reviews: (latestReviews || []).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        author: r.guests?.name || 'Comensal Verificado',
        created_at: r.created_at
      }))
    };
  }

  /**
   * 2. Carta Completa y Menú en Realidad Aumentada
   */
  static async getRestaurantMenu(restaurantId, { category, onlyAr = false } = {}) {
    const supabase = getSupabase();

    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (onlyAr) {
      query = query.not('model_3d_url', 'is', null);
    }

    const { data, error } = await query.order('is_featured_ar', { ascending: false }).order('name', { ascending: true });
    if (error) throw error;

    return data || [];
  }

  /**
   * 3. Motor de Reservas: Bloqueo de 5 Minutos (on_hold) y Zero-Login
   */
  static async createHoldBooking({
    restaurantSlugOrId,
    guestName,
    phoneWhatsapp,
    bookingDate,
    bookingTime,
    partySize,
    specialRequests = '',
    preferredZone = null
  }) {
    const supabase = getSupabase();

    // A. Limpiar reservas expiradas en segundo plano
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'on_hold')
      .lt('hold_expires_at', new Date().toISOString());

    // B. Obtener restaurante
    let restQuery = supabase.from('restaurants').select('id, name, deposit_usd, is_active');
    if (isUUID(restaurantSlugOrId)) {
      restQuery = restQuery.eq('id', restaurantSlugOrId);
    } else {
      restQuery = restQuery.eq('slug', restaurantSlugOrId);
    }
    const { data: restaurant } = await restQuery.single();

    if (!restaurant || !restaurant.is_active) {
      const err = new Error('Restaurante no disponible para reservas');
      err.statusCode = 404;
      throw err;
    }

    const size = Number(partySize) || 2;

    // C. Buscar mesas activas elegibles por capacidad
    let tableQuery = supabase
      .from('tables')
      .select('id, table_number, zone, capacity_min, capacity_max')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .gte('capacity_max', size)
      .order('capacity_max', { ascending: true });

    if (preferredZone) {
      tableQuery = tableQuery.eq('zone', preferredZone);
    }

    const { data: tables } = await tableQuery;
    if (!tables || tables.length === 0) {
      const err = new Error(`No hay mesas configuradas para ${size} personas en la zona solicitada.`);
      err.statusCode = 400;
      throw err;
    }

    // D. Verificar colisión con reservas activas o en hold
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('table_id')
      .eq('restaurant_id', restaurant.id)
      .eq('booking_date', bookingDate)
      .eq('booking_time', bookingTime)
      .in('status', ['on_hold', 'confirmed', 'seated']);

    const occupiedTableIds = new Set((activeBookings || []).map(b => b.table_id));
    const freeTable = tables.find(t => !occupiedTableIds.has(t.id));

    if (!freeTable) {
      const err = new Error(`Horario ${bookingTime} del ${bookingDate} no disponible (SOLD_OUT para ${size} personas).`);
      err.statusCode = 409;
      throw err;
    }

    // E. Resolver o crear Perfil Zero-Login vía WhatsApp
    let guestId = null;
    const cleanPhone = phoneWhatsapp.replace(/\s+/g, '');
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id, is_blacklisted, no_show_count, karma_points')
      .eq('phone_whatsapp', cleanPhone)
      .maybeSingle();

    if (existingGuest) {
      if (existingGuest.is_blacklisted) {
        const err = new Error('Número bloqueado por reiteradas inasistencias sin previo aviso.');
        err.statusCode = 403;
        throw err;
      }
      guestId = existingGuest.id;
    } else {
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: guestName,
          phone_whatsapp: cleanPhone,
          karma_points: 0
        })
        .select('id')
        .single();

      if (guestError) throw guestError;
      guestId = newGuest.id;
    }

    // F. Generar Código Único BK-XXXX y Hold de 5 minutos
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const bookingCode = `BK-${randomHex}`;
    const holdExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // +5 min

    const { data: newBooking, error: bookError } = await supabase
      .from('bookings')
      .insert({
        booking_code: bookingCode,
        restaurant_id: restaurant.id,
        table_id: freeTable.id,
        guest_id: guestId,
        booking_date: bookingDate,
        booking_time: bookingTime,
        party_size: size,
        status: 'on_hold',
        hold_expires_at: holdExpiresAt,
        deposit_amount: restaurant.deposit_usd,
        special_requests: specialRequests
      })
      .select('*')
      .single();

    if (bookError) throw bookError;

    return {
      booking_code: newBooking.booking_code,
      status: 'on_hold',
      restaurant_name: restaurant.name,
      table_assigned: {
        number: freeTable.table_number,
        zone: freeTable.zone
      },
      party_size: size,
      booking_date: bookingDate,
      booking_time: bookingTime,
      deposit_required_usd: restaurant.deposit_usd,
      hold_expires_at: holdExpiresAt,
      hold_time_seconds: 300,
      next_action: 'Enviar comprobante de pago de $1.00 para confirmar la mesa'
    };
  }

  /**
   * 4. Confirmar Depósito de $1.00 (Pase a 'confirmed' y Karma Points)
   */
  static async confirmPayment({ bookingCode, method, reference }) {
    const supabase = getSupabase();

    // A. Buscar reserva
    const { data: booking, error: bookError } = await supabase
      .from('bookings')
      .select('*, guests(id, name, karma_points)')
      .eq('booking_code', bookingCode)
      .single();

    if (bookError || !booking) {
      const err = new Error(`Reserva con código '${bookingCode}' no encontrada.`);
      err.statusCode = 404;
      throw err;
    }

    // Si ya está confirmada
    if (booking.status === 'confirmed') {
      return {
        message: 'Reserva ya se encuentra confirmada',
        booking_code: booking.booking_code,
        status: 'confirmed'
      };
    }

    // Validar si el hold expiró
    if (booking.status === 'on_hold' && new Date(booking.hold_expires_at) < new Date()) {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
      const err = new Error('El bloqueo de 5 minutos expiró. La mesa ha sido liberada.');
      err.statusCode = 410; // Gone
      throw err;
    }

    // B. Insertar transacción en payments
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        amount_usd: booking.deposit_amount,
        method: method || 'pago_movil',
        reference: reference || `REF-${Date.now()}`,
        status: 'approved',
        paid_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (payError) throw payError;

    // C. Pasar reserva a confirmed
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id);

    // D. Bonificar con +10 Karma Points al comensal
    if (booking.guest_id) {
      await supabase
        .from('guests')
        .update({
          karma_points: (booking.guests?.karma_points || 0) + 10,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.guest_id);
    }

    return {
      success: true,
      booking_code: booking.booking_code,
      status: 'confirmed',
      payment: {
        amount_usd: payment.amount_usd,
        method: payment.method,
        reference: payment.reference,
        paid_at: payment.paid_at
      },
      comensal: {
        name: booking.guests?.name,
        karma_points_awarded: 10,
        total_karma_points: (booking.guests?.karma_points || 0) + 10
      },
      message: '¡Reserva garantizada con éxito! Mesa reservada en sala.'
    };
  }

  /**
   * 5. Consultar Estado de Reserva por Código
   */
  static async getBookingByCode(bookingCode) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_code, booking_date, booking_time, party_size, status, hold_expires_at, deposit_amount, special_requests,
        restaurants(id, name, slug, address, phone_whatsapp),
        tables(table_number, zone),
        guests(name, phone_whatsapp, karma_points),
        payments(amount_usd, method, reference, status, paid_at)
      `)
      .eq('booking_code', bookingCode)
      .single();

    if (error || !data) {
      const err = new Error(`Reserva '${bookingCode}' no encontrada.`);
      err.statusCode = 404;
      throw err;
    }

    return data;
  }

  /**
   * 6. Reseñas Verificadas de un Restaurante
   */
  static async getReviews(restaurantSlugOrId) {
    const supabase = getSupabase();

    let restQuery = supabase.from('restaurants').select('id, name');
    if (isUUID(restaurantSlugOrId)) {
      restQuery = restQuery.eq('id', restaurantSlugOrId);
    } else {
      restQuery = restQuery.eq('slug', restaurantSlugOrId);
    }
    const { data: restaurant } = await restQuery.single();

    if (!restaurant) {
      const err = new Error('Restaurante no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, guests(name)')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      restaurant_name: restaurant.name,
      total_reviews: (reviews || []).length,
      reviews: (reviews || []).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        author: r.guests?.name || 'Comensal Verificado',
        created_at: r.created_at
      }))
    };
  }
}
