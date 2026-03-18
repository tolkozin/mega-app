-- ============================================================
-- Revenue Map — Full Supabase Schema
-- Run this in Supabase SQL Editor on a fresh project
-- ============================================================

-- ========================
-- STEP 1: CREATE ALL TABLES
-- ========================

-- 1. PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    username TEXT DEFAULT '',
    telegram TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    company_address TEXT DEFAULT '',
    tax_id TEXT DEFAULT '',
    bank_details TEXT DEFAULT '',
    lemon_squeezy_customer_id TEXT DEFAULT NULL,
    lemon_squeezy_subscription_id TEXT DEFAULT NULL,
    subscription_status TEXT DEFAULT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plus', 'pro', 'enterprise')),
    ai_chat_count INTEGER NOT NULL DEFAULT 0,
    ai_report_count INTEGER NOT NULL DEFAULT 0,
    ai_voice_seconds INTEGER NOT NULL DEFAULT 0,
    ai_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROJECTS
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    product_type TEXT NOT NULL CHECK (product_type IN ('subscription', 'ecommerce', 'saas')),
    public_token UUID DEFAULT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SCENARIOS
CREATE TABLE public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PROJECT SHARES
CREATE TABLE public.project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, shared_with_id)
);

-- 5. INVOICES
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL DEFAULT '',
    customer_name TEXT NOT NULL DEFAULT '',
    customer_email TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'scheduled', 'unpaid')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    items JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================
-- STEP 2: INDEXES
-- ========================

CREATE INDEX idx_profiles_ls_customer_id ON public.profiles(lemon_squeezy_customer_id)
  WHERE lemon_squeezy_customer_id IS NOT NULL;
CREATE INDEX idx_profiles_ls_subscription_id ON public.profiles(lemon_squeezy_subscription_id)
  WHERE lemon_squeezy_subscription_id IS NOT NULL;
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_public_token ON public.projects(public_token) WHERE public_token IS NOT NULL;
CREATE INDEX idx_scenarios_project_id ON public.scenarios(project_id);
CREATE INDEX idx_project_shares_project_id ON public.project_shares(project_id);
CREATE INDEX idx_project_shares_shared_with_id ON public.project_shares(shared_with_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);

-- ========================
-- STEP 3: ENABLE RLS
-- ========================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- ========================
-- STEP 4: TRIGGER — auto-create profile on signup
-- ========================

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

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- STEP 5: ALL RLS POLICIES
-- ========================

-- ---- PROFILES ----
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Authenticated users can lookup profiles by email"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ---- PROJECTS ----
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared projects"
    ON public.projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_shares
            WHERE project_shares.project_id = projects.id
            AND project_shares.shared_with_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view public projects"
    ON public.projects FOR SELECT
    USING (is_public = true AND public_token IS NOT NULL);

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- ---- SCENARIOS ----
CREATE POLICY "Users can view scenarios of own projects"
    ON public.scenarios FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = scenarios.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view scenarios of shared projects"
    ON public.scenarios FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.project_shares
            WHERE project_shares.project_id = scenarios.project_id
            AND project_shares.shared_with_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert scenarios into own projects"
    ON public.scenarios FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = scenarios.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Editors can insert scenarios into shared projects"
    ON public.scenarios FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.project_shares
            WHERE project_shares.project_id = scenarios.project_id
            AND project_shares.shared_with_id = auth.uid()
            AND project_shares.role = 'editor'
        )
    );

CREATE POLICY "Users can delete scenarios from own projects"
    ON public.scenarios FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = scenarios.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Editors can delete scenarios from shared projects"
    ON public.scenarios FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.project_shares
            WHERE project_shares.project_id = scenarios.project_id
            AND project_shares.shared_with_id = auth.uid()
            AND project_shares.role = 'editor'
        )
    );

-- ---- PROJECT SHARES ----
CREATE POLICY "Owners can view shares they created"
    ON public.project_shares FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Shared users can view their own shares"
    ON public.project_shares FOR SELECT
    USING (auth.uid() = shared_with_id);

CREATE POLICY "Project owners can create shares"
    ON public.project_shares FOR INSERT
    WITH CHECK (
        auth.uid() = owner_id
        AND EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_shares.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update shares"
    ON public.project_shares FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete shares"
    ON public.project_shares FOR DELETE
    USING (auth.uid() = owner_id);

-- ---- INVOICES ----
CREATE POLICY "Users can view own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
    ON public.invoices FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
    ON public.invoices FOR DELETE
    USING (auth.uid() = user_id);
