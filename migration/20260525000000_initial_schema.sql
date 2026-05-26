-- Custom ENUM types
CREATE TYPE public.platform_type AS ENUM ('instagram', 'tiktok', 'linkedin');
CREATE TYPE public.asset_type_enum AS ENUM ('image', 'video', 'video_script');
CREATE TYPE public.asset_status_enum AS ENUM ('pending', 'approved', 'rejected');

-- 1. PROFILE TABLE
-- Extends the Supabase auth.users table, automatically created via triggers
CREATE TABLE public.profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. WORKSPACE TABLE
-- Defines a boundary for multiple user campaigns and brand configurations
CREATE TABLE public.workspace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profile(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BRAND TABLE
-- Owns target audiences and brand guidelines. Associated 1:1 with workspaces.
CREATE TABLE public.brand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspace(id) ON DELETE CASCADE UNIQUE NOT NULL,
    core_mission TEXT,
    target_audience TEXT,
    personality_traits TEXT[],
    brand_colors TEXT[],
    competitor JSONB
);

-- 4. CAMPAIGN TABLE
-- Contains specific campaigns targeting platforms
CREATE TABLE public.campaign (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspace(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    targeted_platform public.platform_type[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STRATEGY TABLE
-- Tied 1:1 with campaigns
CREATE TABLE public.strategy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaign(id) ON DELETE CASCADE UNIQUE NOT NULL,
    objective TEXT,
    kpis JSONB
);

-- 6. PERSONA TABLE
-- Persona demographics and motivations
CREATE TABLE public.persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaign(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    demographics JSONB,
    pain_points TEXT[],
    motivations TEXT[]
);

-- 7. ASSET TABLE
-- Campaign assets (images are stored in S3 bucket, media_url stores the S3 public object URL)
CREATE TABLE public.asset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaign(id) ON DELETE CASCADE NOT NULL,
    platform public.platform_type NOT NULL,
    asset_type public.asset_type_enum NOT NULL,
    media_url TEXT, -- Stores public S3 object URL
    caption TEXT,
    status public.asset_status_enum DEFAULT 'pending'::public.asset_status_enum NOT NULL,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- Indexing for lookup performance optimization
CREATE INDEX idx_workspace_profile_id ON public.workspace(profile_id);
CREATE INDEX idx_brand_workspace_id ON public.brand(workspace_id);
CREATE INDEX idx_campaign_workspace_id ON public.campaign(workspace_id);
CREATE INDEX idx_strategy_campaign_id ON public.strategy(campaign_id);
CREATE INDEX idx_persona_campaign_id ON public.persona(campaign_id);
CREATE INDEX idx_asset_campaign_id ON public.asset(campaign_id);

-- Profile Trigger Function
-- Automatically creates a public.profile record when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profile (id, full_name, created_at)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind handle_new_user trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger function to update updated_at if not exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Bind set_updated_at trigger to workspace table
CREATE OR REPLACE TRIGGER on_workspace_updated
  BEFORE UPDATE ON public.workspace
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

