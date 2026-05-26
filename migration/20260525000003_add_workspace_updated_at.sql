-- Migration to add updated_at column and trigger to workspace table
ALTER TABLE public.workspace
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Create trigger function to update updated_at if it exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Bind set_updated_at trigger to workspace table
DROP TRIGGER IF EXISTS on_workspace_updated ON public.workspace;
CREATE TRIGGER on_workspace_updated
  BEFORE UPDATE ON public.workspace
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
