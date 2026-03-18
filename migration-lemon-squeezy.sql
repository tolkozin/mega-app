-- ============================================================
-- Revenue Map — Lemon Squeezy Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add "plus" and "expired" to plan CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'expired', 'plus', 'pro', 'enterprise'));

-- 2. Replace Stripe columns with Lemon Squeezy columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL;

-- 3. Indexes for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ls_customer_id ON public.profiles(lemon_squeezy_customer_id)
  WHERE lemon_squeezy_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_ls_subscription_id ON public.profiles(lemon_squeezy_subscription_id)
  WHERE lemon_squeezy_subscription_id IS NOT NULL;

-- 4. New users get profile only — no default project (must subscribe first)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
    -- No default project — user must subscribe to create projects
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. AI usage counter columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_chat_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_report_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_voice_seconds INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_period_start TIMESTAMPTZ NOT NULL DEFAULT now();
