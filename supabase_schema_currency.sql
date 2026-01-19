-- MULTI-CURRENCY SUPPORT
-- adds regional price bands to products table

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_usd numeric,
ADD COLUMN IF NOT EXISTS price_gbp numeric,
ADD COLUMN IF NOT EXISTS price_eur numeric,
ADD COLUMN IF NOT EXISTS price_aed numeric;

-- Initialize with rough psychological conversions (Base INR)
-- Assumption: price column is INR
UPDATE public.products 
SET 
  price_usd = ROUND((price / 84)::numeric, 0), -- Rough INR to USD
  price_gbp = ROUND((price / 105)::numeric, 0), -- Rough INR to GBP
  price_eur = ROUND((price / 90)::numeric, 0),  -- Rough INR to EUR
  price_aed = ROUND((price / 22)::numeric, 0)   -- Rough INR to AED
WHERE price_usd IS NULL;

-- Make them "Psychological" (ending in 0, 5, 9) - simple heuristic update
-- This acts as a default. Admin can override with specific tier pricing later.
UPDATE public.products
SET
  price_usd = CASE WHEN price_usd > 100 THEN ROUND(price_usd / 5) * 5 ELSE price_usd END,
  price_gbp = CASE WHEN price_gbp > 80 THEN ROUND(price_gbp / 5) * 5 ELSE price_gbp END;
