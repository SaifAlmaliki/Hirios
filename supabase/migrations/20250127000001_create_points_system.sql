-- Create points system tables
-- This migration implements a point-based pricing system for Hirios

-- Create user_points table to track current point balance for each user
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create point_transactions table to track all point transactions
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'screening', 'voice_interview', 'bonus', 'refund')),
  points INTEGER NOT NULL, -- Positive for additions, negative for deductions
  description TEXT NOT NULL,
  reference_id UUID, -- Reference to screening_result, purchase, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create point_packages table for available point packages
CREATE TABLE public.point_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- Price in cents to avoid floating point issues
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default point packages
INSERT INTO public.point_packages (name, points, price_cents, is_active) VALUES
  ('Starter Pack', 50, 5000, true),    -- $50 for 50 points
  ('Growth Pack', 100, 8000, true),    -- $80 for 100 points  
  ('Business Pack', 200, 15000, true), -- $150 for 200 points
  ('Enterprise Pack', 500, 25000, true); -- $250 for 500 points

-- Enable RLS on new tables
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_points
CREATE POLICY "Users can view their own points" 
  ON public.user_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" 
  ON public.user_points 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points" 
  ON public.user_points 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for point_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.point_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.point_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for point_packages (public read access)
CREATE POLICY "Anyone can view active point packages" 
  ON public.point_packages 
  FOR SELECT 
  USING (is_active = true);

-- Create function to add points to a user
CREATE OR REPLACE FUNCTION public.add_points(
  target_user_id UUID,
  points_to_add INTEGER,
  transaction_type TEXT,
  description TEXT,
  reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance or create record if doesn't exist
  INSERT INTO public.user_points (user_id, points_balance)
  VALUES (target_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current balance
  SELECT points_balance INTO current_balance
  FROM public.user_points
  WHERE user_id = target_user_id;
  
  -- Update balance
  UPDATE public.user_points
  SET points_balance = points_balance + points_to_add,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Record transaction
  INSERT INTO public.point_transactions (user_id, transaction_type, points, description, reference_id)
  VALUES (target_user_id, transaction_type, points_to_add, description, reference_id);
  
  RETURN TRUE;
END;
$$;

-- Create function to deduct points from a user
CREATE OR REPLACE FUNCTION public.deduct_points(
  target_user_id UUID,
  points_to_deduct INTEGER,
  transaction_type TEXT,
  description TEXT,
  reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT points_balance INTO current_balance
  FROM public.user_points
  WHERE user_id = target_user_id;
  
  -- Check if user has enough points
  IF current_balance IS NULL OR current_balance < points_to_deduct THEN
    RETURN FALSE;
  END IF;
  
  -- Update balance
  UPDATE public.user_points
  SET points_balance = points_balance - points_to_deduct,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Record transaction (negative points for deduction)
  INSERT INTO public.point_transactions (user_id, transaction_type, points, description, reference_id)
  VALUES (target_user_id, transaction_type, -points_to_deduct, description, reference_id);
  
  RETURN TRUE;
END;
$$;

-- Create function to get user's current point balance
CREATE OR REPLACE FUNCTION public.get_user_points(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT COALESCE(points_balance, 0) INTO current_balance
  FROM public.user_points
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(current_balance, 0);
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX idx_point_packages_active ON public.point_packages(is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE public.user_points IS 'Tracks current point balance for each user';
COMMENT ON TABLE public.point_transactions IS 'Audit trail of all point transactions (purchases, deductions, bonuses)';
COMMENT ON TABLE public.point_packages IS 'Available point packages for purchase';
COMMENT ON FUNCTION public.add_points IS 'Adds points to a user and records the transaction';
COMMENT ON FUNCTION public.deduct_points IS 'Deducts points from a user if they have sufficient balance';
COMMENT ON FUNCTION public.get_user_points IS 'Gets the current point balance for a user';
