-- Migration to add purpose column to campaign table
ALTER TABLE public.campaign
ADD COLUMN IF NOT EXISTS purpose TEXT;
