-- ============================================================
-- Revenue Map — Lemon Squeezy Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add "plus" to plan CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'plus', 'pro', 'enterprise'));

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

-- 4. New users get 1 project (Free limit), not 3
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
    INSERT INTO public.projects (user_id, name, description, product_type) VALUES
      (NEW.id, 'My First Project', 'Get started with your first financial model', 'subscription');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
