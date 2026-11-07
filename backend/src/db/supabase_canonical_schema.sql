-- ============================================================================
-- 🗄️ ESQUEMA CANÓNICO BUKEA (MÓDULO 1: UI COMENSAL)
-- Motor: PostgreSQL 15+ (Supabase)
-- Enfoque: Alto Rendimiento, Zero-Login, Anti-Spam ($1 Hold) y Menú AR
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
        'no_show',      -- No se presentó (incrementa contador en guests)
        'cancelled'     -- Cancelada voluntariamente
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM (
        'c2p',
        'pago_movil',
        'tarjeta',
        'binance',
        'karma_points'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'pending',
        'approved',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
    zone TEXT NOT NULL, -- 'Terraza', 'Salón', 'Frente al Mar', 'Balinesa'
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
    category TEXT NOT NULL, -- 'Entradas', 'Mariscos', 'Cortes', 'Coctelería'
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    photo_url TEXT,
    model_3d_url TEXT, -- Archivo .glb / .usdz para AR QuickLook / Three.js
    is_featured_ar BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: GUESTS (Perfil del Comensal Zero-Login vía WhatsApp)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone_whatsapp TEXT UNIQUE NOT NULL,
    karma_points INTEGER NOT NULL DEFAULT 0,
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
    booking_code TEXT UNIQUE NOT NULL, -- ej: 'BK-5821'
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    status booking_status_enum NOT NULL DEFAULT 'on_hold',
    hold_expires_at TIMESTAMPTZ, -- Vencimiento de los 5 min
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
    CONSTRAINT uq_reviews_booking UNIQUE (booking_id) -- 1 reseña por reserva
);

-- ----------------------------------------------------------------------------
-- 8. TABLA: PAYMENTS (Libro Contable del Depósito de $1 y Pagos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    method payment_method_enum NOT NULL,
    reference TEXT,
    status payment_status_enum NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. ÍNDICES DE RENDIMIENTO (Optimización Sub-10ms)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON public.restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_lookup ON public.tables(restaurant_id, is_active, capacity_max);
CREATE INDEX IF NOT EXISTS idx_tables_nfc ON public.tables(nfc_token) WHERE nfc_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_featured ON public.menu_items(restaurant_id, is_featured_ar) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone_whatsapp);
CREATE INDEX IF NOT EXISTS idx_bookings_matrix ON public.bookings(restaurant_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_hold ON public.bookings(status, hold_expires_at) WHERE status = 'on_hold';
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);

-- ----------------------------------------------------------------------------
-- 10. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) EN SUPABASE
-- ----------------------------------------------------------------------------
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Lectura pública para comensales (UI)
CREATE POLICY "Public restaurants read" ON public.restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Public tables read" ON public.tables FOR SELECT USING (is_active = true);
CREATE POLICY "Public menu read" ON public.menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public reviews read" ON public.reviews FOR SELECT USING (true);

-- Permisos de bookings & guests para app pública / service role
CREATE POLICY "Public bookings insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public bookings read" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public guests read_insert" ON public.guests FOR ALL USING (true);
CREATE POLICY "Public payments read_insert" ON public.payments FOR ALL USING (true);

-- ----------------------------------------------------------------------------
-- 11. AUTOMATISMOS: TRIGGER PARA REVIEWS Y CALIFICACIÓN PROMEDIO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_restaurant_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.restaurants
    SET 
        rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE restaurant_id = NEW.restaurant_id),
        reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE restaurant_id = NEW.restaurant_id),
        updated_at = now()
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_restaurant_rating ON public.reviews;
CREATE TRIGGER trg_update_restaurant_rating
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_restaurant_rating_stats();

-- ----------------------------------------------------------------------------
-- 12. DATOS SEMILLA (DOWNTOWN BEACH CLUB & CASA CAMPO BISTRÓ)
-- ----------------------------------------------------------------------------

-- A. Restaurante 1: Downtown Beach Club
INSERT INTO public.restaurants (
    id, slug, name, tagline, description, address, latitude, longitude,
    google_place_id, rating, reviews_count, is_bukea_selection, tags,
    perks, media, hours, phone_whatsapp, deposit_usd, is_active
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'downtown-beach-club',
    'Downtown Beach Club',
    'Gastronomía de autor, mixología y ambiente frente al mar',
    'Ubicado en el epicentro costero más exclusivo de la isla, Downtown Beach Club combina cocina de brasas a leña, pesca fresca artesanal, camas balinesas y coctelería botánica bajo una atmósfera sofisticada y vibrante.',
    'Boulevard Costero Playa El Agua, Sector La Mira, Pampatar, Nueva Esparta',
    11.1452800,
    -63.8569400,
    'ChIJN1t_DowntownBeachClub_001',
    4.90,
    70,
    true,
    ARRAY['Comida del Mar', 'Mixología', 'Frente al Mar', 'Brasas'],
    '[
        {"icon": "waves", "text": "Vista panorámica al mar Caribe y acceso directo"},
        {"icon": "sparkles", "text": "Camas balinesas exclusivas con servicio VIP"},
        {"icon": "nfc", "text": "Pedido digital y comanda táctil por chip NFC"}
    ]'::jsonb,
    '[
        {"url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "caption": "Playa El Agua & Lounge"},
        {"url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80", "caption": "Brasas y cocina abierta"},
        {"url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80", "caption": "Salón principal al atardecer"}
    ]'::jsonb,
    '{
        "monday": {"open": "11:00", "close": "23:00"},
        "tuesday": {"open": "11:00", "close": "23:00"},
        "wednesday": {"open": "11:00", "close": "23:00"},
        "thursday": {"open": "11:00", "close": "00:00"},
        "friday": {"open": "11:00", "close": "02:00"},
        "saturday": {"open": "10:30", "close": "02:00"},
        "sunday": {"open": "10:30", "close": "23:00"}
    }'::jsonb,
    '+584149954321',
    1.00,
    true
) ON CONFLICT (slug) DO NOTHING;

-- B. Mesas Downtown Beach Club
INSERT INTO public.tables (id, restaurant_id, table_number, zone, capacity_min, capacity_max, nfc_token, is_active)
VALUES 
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 01', 'Salón', 2, 4, 'NFC-BK-DT-01', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mesa 04', 'Salón', 2, 4, 'NFC-BK-DT-04', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Terraza Mar 01', 'Frente al Mar', 2, 6, 'NFC-BK-DT-T1', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Balinesa VIP 1', 'Balinesa', 4, 8, 'NFC-BK-DT-B1', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Balinesa VIP 2', 'Balinesa', 4, 8, 'NFC-BK-DT-B2', true)
ON CONFLICT (restaurant_id, table_number) DO NOTHING;

-- C. Platos con AR (Realidad Aumentada) y Carta
INSERT INTO public.menu_items (id, restaurant_id, name, description, category, price_usd, photo_url, model_3d_url, is_featured_ar, is_available)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Langosta al Fuego de Leña', 'Cola de langosta fresca del Caribe glaseada con mantequilla de ajo negro, tomillo y limón criollo a las brasas.', 'Mariscos & Brasas', 38.00, 'https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=500&q=80', 'https://bukea.inkbytecorpore.workers.dev/models/langosta_3d.glb', true, true),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ceviche Tropical de Mero', 'Láminas de mero fresco marinadas en leche de tigre de maracuyá, batata caramelizada y chips de plátano.', 'Entradas Frías', 18.00, 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=500&q=80', 'https://bukea.inkbytecorpore.workers.dev/models/ceviche_3d.glb', true, true),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tomahawk Steak Angus (1.2 kg)', 'Corte con hueso largo madurado en seco por 30 días, terminado con sal marina de Araya y romero.', 'Cortes de Autor', 55.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80', 'https://bukea.inkbytecorpore.workers.dev/models/tomahawk_3d.glb', true, true),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sunset Passion Cocktail', 'Ron añejo premium, maceración de frutos rojos, jugo de parita fresca y humo de canela.', 'Coctelería de Autor', 12.00, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=80', 'https://bukea.inkbytecorpore.workers.dev/models/cocktail_3d.glb', true, true)
ON CONFLICT (id) DO NOTHING;

-- D. Comensal Semilla (Zero-Login)
INSERT INTO public.guests (id, name, phone_whatsapp, karma_points, no_show_count, is_blacklisted)
VALUES 
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Alejandro Mendoza', '+584143329988', 120, 0, false),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'Valentina Rossi', '+584128841122', 80, 0, false)
ON CONFLICT (phone_whatsapp) DO NOTHING;

-- E. Reserva de Prueba Semilla
INSERT INTO public.bookings (
    id, booking_code, restaurant_id, table_id, guest_id,
    booking_date, booking_time, party_size, status, deposit_amount, special_requests
) VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    'BK-5821',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', -- Terraza Mar 01
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', -- Alejandro Mendoza
    CURRENT_DATE,
    '17:30',
    2,
    'confirmed',
    1.00,
    'Mesa frente al atardecer. Celebración de aniversario.'
) ON CONFLICT (booking_code) DO NOTHING;

-- F. Pago del Depósito de $1.00
INSERT INTO public.payments (
    id, booking_id, amount_usd, method, reference, status, paid_at
) VALUES (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    1.00,
    'pago_movil',
    'REF-PM-992834',
    'approved',
    now()
) ON CONFLICT (id) DO NOTHING;

-- G. Reseña Verificada
INSERT INTO public.reviews (
    id, restaurant_id, guest_id, booking_id, rating, comment
) VALUES (
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    5,
    'La mejor experiencia culinaria frente al mar en Margarita. El menú en Realidad Aumentada nos permitió ver el tamaño de la langosta antes de pedirla y la reserva con el código BK-5821 fue inmediata.'
) ON CONFLICT (booking_id) DO NOTHING;
