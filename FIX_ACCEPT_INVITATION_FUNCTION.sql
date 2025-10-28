-- Fix: Update accept_team_invitation to include email column
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
    existing_profile_id uuid;
    current_user_email text;
BEGIN
    -- Get current user's email
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Get invitation details
    SELECT * INTO invitation_record
    FROM public.team_invitations
    WHERE token = invitation_token
    AND used = false;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
    END IF;

    -- Verify email matches
    IF current_user_email != invitation_record.invited_email THEN
        RETURN json_build_object('success', false, 'error', 'Email does not match invitation');
    END IF;

    -- Check if user already has a company profile
    SELECT id INTO existing_profile_id
    FROM public.company_profiles
    WHERE user_id = auth.uid();

    IF existing_profile_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'User already has a company profile');
    END IF;

    -- Create a new company profile for the member linked to the same company
    INSERT INTO public.company_profiles (
        user_id,
        email,
        company_name,
        company_description,
        company_website,
        company_size,
        industry,
        address,
        phone,
        logo_url,
        subscription_plan,
        role,
        created_at,
        updated_at
    )
    SELECT
        auth.uid(),
        current_user_email,
        company_name,
        company_description,
        company_website,
        company_size,
        industry,
        address,
        phone,
        logo_url,
        subscription_plan,
        'member',
        NOW(),
        NOW()
    FROM public.company_profiles
    WHERE id = invitation_record.company_profile_id;

    -- Mark invitation as used
    UPDATE public.team_invitations
    SET used = true
    WHERE id = invitation_record.id;

    RETURN json_build_object(
        'success', true,
        'company_profile_id', invitation_record.company_profile_id
    );
END;
$$;

-- Ensure permissions are set
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO anon;
