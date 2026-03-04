-- Mega App — Additional Supabase migrations
-- Run these in Supabase SQL Editor after the initial schema.sql

-- Public dashboards (Phase 8)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_projects_public_token ON public.projects(public_token) WHERE public_token IS NOT NULL;

CREATE POLICY "Anyone can view public projects"
    ON public.projects FOR SELECT
    USING (is_public = true AND public_token IS NOT NULL);

-- Billing (Phase 7)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'enterprise'));
