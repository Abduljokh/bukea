-- ============================================================================
-- 🗄️ ESQUEMA CANÓNICO BUKEA (MÓDULO 1: UI COMENSAL) - VERSIÓN DEFINITIVA v1.1
-- Motor: PostgreSQL 15+ (Supabase)
-- Actualización: Login Supabase Auth, Membresía $4/mes, Tiers y Bukea-Pay
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM (
        'on_hold',      -- Bloqueo temporal de 5 min mientras se efectúa el depósito
        'confirmed',    -- Depósito confirmado o reservado con Karma Points
        'seated',       -- Comensal recibido en sala
        'finished',     -- Experiencia completada
        'no_show',      -- No se presentó
        'cancelled'     -- Cancelada voluntariamente
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM (
        'c2p',
        'pago_movil',
        'tarjeta',
        'binance',
        'karma_points'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'pending',
        'approved',
        'refunded'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE guest_tier_enum AS ENUM (
        'explorer',     -- $0 consumo
        'foodie',       -- $80 consumo
        'vip'           -- $200 consumo
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_type_enum AS ENUM (
        'deposit',                  -- Depósito anti-spam de reserva ($1.00)
        'table_check',              -- Cuenta de consumo en sala (Bukea-Pay)
        'membership_subscription'   -- Membresía Black/Ultra ($4.00/mes)
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ----------------------------------------------------------------------------
-- 2. TABLA: RESTAURANTS (Ficha Maestra del Local)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    google_place_id TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating BETWEEN 1.00 AND 5.00),
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_bukea_selection BOOLEAN NOT NULL DEFAULT false,
    tags TEXT[] NOT NULL DEFAULT '{}',
    perks JSONB NOT NULL DEFAULT '[]'::jsonb,
    media JSONB NOT NULL DEFAULT '[]'::jsonb,
    hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    phone_whatsapp TEXT NOT NULL,
    deposit_usd NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: TABLES (Inventario de Sala y Zonas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    zone TEXT NOT NULL,
    capacity_min INTEGER NOT NULL DEFAULT 1,
    capacity_max INTEGER NOT NULL DEFAULT 4,
    nfc_token TEXT UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_tables_restaurant_number UNIQUE (restaurant_id, table_number)
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: MENU_ITEMS (Carta y Platos en 3D / Realidad Aumentada)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    photo_url TEXT,
    model_3d_url TEXT,
    is_featured_ar BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: GUESTS (Perfil del Comensal, Login & Membresía)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone_whatsapp TEXT UNIQUE NOT NULL,
    email TEXT,
    karma_points INTEGER NOT NULL DEFAULT 0,
    tier guest_tier_enum NOT NULL DEFAULT 'explorer',
    total_spent_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_vip_member BOOLEAN NOT NULL DEFAULT false,
    membership_expires_at TIMESTAMPTZ,
    no_show_count INTEGER NOT NULL DEFAULT 0,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. TABLA: BOOKINGS (Motor de Reservas, Estados y Holds de 5 min)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    status booking_status_enum NOT NULL DEFAULT 'on_hold',
    hold_expires_at TIMESTAMPTZ,
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: REVIEWS (Social Proof y Reseñas Verificadas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_reviews_booking UNIQUE (booking_id)
);

-- ----------------------------------------------------------------------------
-- 8. TABLA: PAYMENTS (Depósitos, Cuentas en Sala y Membresías)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE, -- Nullable para membresías
    payment_type payment_type_enum NOT NULL DEFAULT 'deposit',
    amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    method payment_method_enum NOT NULL,
    reference TEXT,
    status payment_status_enum NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. ÍNDICES DE RENDIMIENTO
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON public.restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_lookup ON public.tables(restaurant_id, is_active, capacity_max);
CREATE INDEX IF NOT EXISTS idx_tables_nfc ON public.tables(nfc_token) WHERE nfc_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_featured ON public.menu_items(restaurant_id, is_featured_ar) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone_whatsapp);
CREATE INDEX IF NOT EXISTS idx_guests_auth ON public.guests(auth_id) WHERE auth_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_matrix ON public.bookings(restaurant_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_hold ON public.bookings(status, hold_expires_at) WHERE status = 'on_hold';
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_guest ON public.payments(guest_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(payment_type);
