-- ============================================================================
-- 🚀 MIGRACIÓN QUIRÚRGICA BUKEA v1.1: LOGIN SUPABASE AUTH & MEMBRESÍAS
-- Motor: PostgreSQL 15+ (Supabase SQL Editor)
-- Aplica sobre: public.guests y public.payments (Sin tocar las otras 5 tablas)
-- ============================================================================

-- 1. Crear los nuevos tipos ENUM requeridos
DO $$ BEGIN
    CREATE TYPE guest_tier_enum AS ENUM ('explorer', 'foodie', 'vip');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_type_enum AS ENUM ('deposit', 'table_check', 'membership_subscription');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Modificaciones en la tabla public.guests
ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS tier guest_tier_enum NOT NULL DEFAULT 'explorer',
    ADD COLUMN IF NOT EXISTS total_spent_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS is_vip_member BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;

-- Índices de búsqueda en guests
CREATE INDEX IF NOT EXISTS idx_guests_auth_id ON public.guests(auth_id) WHERE auth_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guests_tier ON public.guests(tier);

-- 3. Modificaciones en la tabla public.payments
-- A. Agregar payment_type
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS payment_type payment_type_enum NOT NULL DEFAULT 'deposit';

-- B. Convertir booking_id a NULLABLE (los pagos de membresías de $4/mes no tienen reserva de mesa)
ALTER TABLE public.payments
    ALTER COLUMN booking_id DROP NOT NULL;

-- C. Agregar guest_id obligatorio (FK a guests)
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE;

-- D. Vincular retroactivamente los pagos existentes al comensal de su reserva
UPDATE public.payments p
SET guest_id = b.guest_id
FROM public.bookings b
WHERE p.booking_id = b.id AND p.guest_id IS NULL;

-- Índices de búsqueda en payments
CREATE INDEX IF NOT EXISTS idx_payments_guest ON public.payments(guest_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(payment_type);
