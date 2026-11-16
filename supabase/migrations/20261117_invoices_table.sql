-- ==============================================================================
-- RUANGTEMU VIRTUAL PHOTOBOOTH - INVOICE ARCHIVES TABLE (SUPABASE POSTGRESQL)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_instagram VARCHAR(100),
    customer_address TEXT,
    event_date DATE,
    event_time VARCHAR(50),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 0) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 0) NOT NULL DEFAULT 0,
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12, 0) NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Belum Dibayar',
    payment_method VARCHAR(255) NOT NULL,
    payment_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- RLS (Row Level Security)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read invoices" ON public.invoices
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow insert invoices" ON public.invoices
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow update invoices" ON public.invoices
    FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow delete invoices" ON public.invoices
    FOR DELETE TO anon, authenticated USING (true);
