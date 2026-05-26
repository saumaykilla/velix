-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset ENABLE ROW LEVEL SECURITY;

-- 1. Policies for Profile
CREATE POLICY "Allow users to read their own profile" 
ON public.profile FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
ON public.profile FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: Profile INSERT is handled automatically by the handle_new_user() trigger,
-- which runs as SECURITY DEFINER (bypassing RLS). So no INSERT policy is strictly needed.

-- 2. Policies for Workspace
CREATE POLICY "Allow users to read workspaces they own" 
ON public.workspace FOR SELECT 
TO authenticated 
USING (auth.uid() = profile_id);

CREATE POLICY "Allow users to insert workspaces they own" 
ON public.workspace FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Allow users to update workspaces they own" 
ON public.workspace FOR UPDATE 
TO authenticated 
USING (auth.uid() = profile_id) 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Allow users to delete workspaces they own" 
ON public.workspace FOR DELETE 
TO authenticated 
USING (auth.uid() = profile_id);

-- 3. Policies for Brand
CREATE POLICY "Allow users to read brands of their workspaces" 
ON public.brand FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = brand.workspace_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to insert brands of their workspaces" 
ON public.brand FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = brand.workspace_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to update brands of their workspaces" 
ON public.brand FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = brand.workspace_id AND workspace.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = brand.workspace_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to delete brands of their workspaces" 
ON public.brand FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = brand.workspace_id AND workspace.profile_id = auth.uid()
));

-- 4. Policies for Campaign
CREATE POLICY "Allow users to read campaigns of their workspaces" 
ON public.campaign FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = campaign.workspace_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to insert campaigns of their workspaces" 
ON public.campaign FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = campaign.workspace_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to update campaigns of their workspaces" 
ON public.campaign FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = campaign.workspace_id AND workspace.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = campaign.workspace_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to delete campaigns of their workspaces" 
ON public.campaign FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.workspace 
    WHERE workspace.id = campaign.workspace_id AND workspace.profile_id = auth.uid()
));

-- 5. Policies for Strategy
CREATE POLICY "Allow users to read strategies of their campaigns" 
ON public.strategy FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = strategy.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to insert strategies of their campaigns" 
ON public.strategy FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = strategy.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to update strategies of their campaigns" 
ON public.strategy FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = strategy.campaign_id AND workspace.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = strategy.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to delete strategies of their campaigns" 
ON public.strategy FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = strategy.campaign_id AND workspace.profile_id = auth.uid()
));

-- 6. Policies for Persona
CREATE POLICY "Allow users to read personas of their campaigns" 
ON public.persona FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = persona.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to insert personas of their campaigns" 
ON public.persona FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = persona.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to update personas of their campaigns" 
ON public.persona FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = persona.campaign_id AND workspace.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = persona.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to delete personas of their campaigns" 
ON public.persona FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = persona.campaign_id AND workspace.profile_id = auth.uid()
));

-- 7. Policies for Asset
CREATE POLICY "Allow users to read assets of their campaigns" 
ON public.asset FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = asset.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to insert assets of their campaigns" 
ON public.asset FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = asset.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to update assets of their campaigns" 
ON public.asset FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = asset.campaign_id AND workspace.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = asset.campaign_id AND workspace.profile_id = auth.uid()
));

CREATE POLICY "Allow users to delete assets of their campaigns" 
ON public.asset FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.campaign 
    JOIN public.workspace ON campaign.workspace_id = workspace.id 
    WHERE campaign.id = asset.campaign_id AND workspace.profile_id = auth.uid()
));
