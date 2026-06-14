-- docs/schema.sql
-- -------------------------------------------------------
-- SQL script to initialize Supabase Database Tables.
-- Run this script in the Supabase "SQL Editor" console.
-- -------------------------------------------------------

-- 1. Create Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT NOT NULL,
    saved_name TEXT NOT NULL UNIQUE,
    file_url TEXT, -- URL to PDF file in Supabase Storage
    full_text TEXT,
    summary TEXT,
    issues JSONB DEFAULT '[]'::jsonb,
    principles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable row-level security (RLS) if desired. For ease of use, we keep it simple,
-- but you can customize permissions as needed.
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (for development simplicity)
CREATE POLICY "Allow public read access" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.cases FOR DELETE USING (true);


-- 2. Create Comparisons Table
CREATE TABLE IF NOT EXISTS public.comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_a_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    case_b_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    similarity_score INTEGER,
    similarity_interpretation TEXT,
    common_issues JSONB DEFAULT '[]'::jsonb,
    common_principles JSONB DEFAULT '[]'::jsonb,
    structural_differences JSONB DEFAULT '[]'::jsonb,
    adversarial_strategy JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Prevent duplicate comparisons regardless of selection order (A vs B is same as B vs A)
    CONSTRAINT unique_comparison_pair UNIQUE (case_a_id, case_b_id)
);

ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.comparisons FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.comparisons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.comparisons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.comparisons FOR DELETE USING (true);
