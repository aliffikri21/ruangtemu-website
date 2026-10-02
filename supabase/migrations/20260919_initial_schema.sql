-- RUANGTEMU Digital Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    price NUMERIC NOT NULL,
    duration_hours INT NOT NULL DEFAULT 3,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    popular BOOLEAN DEFAULT false,
    category TEXT NOT NULL CHECK (category IN ('physical', 'virtual', 'hybrid')),
    prints_included TEXT,
    backdrop TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    host_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    date DATE NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Palopo',
    description TEXT,
    cover_image TEXT,
    is_active BOOLEAN DEFAULT true,
    allow_guestbook BOOLEAN DEFAULT true,
    allow_voice_note BOOLEAN DEFAULT true,
    allow_custom_frame BOOLEAN DEFAULT true,
    default_frame_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Palopo',
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    total_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENTRIES (GUEST PHOTOBOOTH CAPTURES & GUESTBOOK)
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    voice_note_url TEXT,
    message TEXT,
    filter_used TEXT DEFAULT 'normal',
    likes_count INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Public can read packages
CREATE POLICY "Allow public read packages" ON public.packages
    FOR SELECT USING (true);

-- Public can read active events
CREATE POLICY "Allow public read active events" ON public.events
    FOR SELECT USING (is_active = true);

-- Public can insert bookings
CREATE POLICY "Allow public insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Public can read approved entries for an event
CREATE POLICY "Allow public read approved entries" ON public.entries
    FOR SELECT USING (is_approved = true);

-- Public can insert entries
CREATE POLICY "Allow public insert entries" ON public.entries
    FOR INSERT WITH CHECK (true);
