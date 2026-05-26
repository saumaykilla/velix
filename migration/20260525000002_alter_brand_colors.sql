-- Migration to alter brand_colors column in public.brand from text array to JSONB
ALTER TABLE public.brand 
  ALTER COLUMN brand_colors TYPE JSONB 
  USING to_jsonb(brand_colors);
