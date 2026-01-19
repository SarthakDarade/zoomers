-- TRANSACTIONAL DATA SCHEMA
-- Refines the order and payment tracking for production grade storage

-- 1. Enhance Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS payment_gateway text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS gateway_order_id text,
ADD COLUMN IF NOT EXISTS gateway_payment_id text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 2. Create Transactions Table (For detailed audit logs of every payment attempt)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    amount numeric NOT NULL,
    currency text NOT NULL,
    gateway text NOT NULL, -- 'stripe' or 'razorpay'
    status text NOT NULL, -- 'success', 'failed', 'pending', 'authorized'
    gateway_transaction_id text,
    gateway_response jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Transactions
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. RLS Policies for Orders (Ensure they exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
    ) THEN
        CREATE POLICY "Users can view their own orders"
            ON public.orders FOR SELECT
            USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Users can create their own orders'
    ) THEN
        CREATE POLICY "Users can create their own orders"
            ON public.orders FOR INSERT
            WITH CHECK (true); -- Allow insert, logic handled by frontend/hooks
    END IF;
END $$;

-- 6. Indexing for Performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
