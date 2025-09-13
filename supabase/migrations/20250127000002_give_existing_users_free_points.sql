-- Give existing users 25 free points
-- This migration gives all existing company users 25 free points

-- Give 25 free points to all existing users who have company profiles
INSERT INTO public.user_points (user_id, points_balance)
SELECT 
  cp.user_id,
  25
FROM public.company_profiles cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_points up 
  WHERE up.user_id = cp.user_id
);

-- Record the bonus transactions for existing users
INSERT INTO public.point_transactions (user_id, transaction_type, points, description)
SELECT 
  cp.user_id,
  'bonus',
  25,
  'Welcome bonus - 25 free points for existing users'
FROM public.company_profiles cp
WHERE EXISTS (
  SELECT 1 FROM public.user_points up 
  WHERE up.user_id = cp.user_id AND up.points_balance = 25
);
