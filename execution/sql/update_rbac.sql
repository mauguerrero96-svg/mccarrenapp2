-- =====================================================
-- UPDATE RBAC FUNCTIONS FOR DEVELOPER ROLE
-- This script updates the helper functions to recognize 'developer' role.
-- =====================================================

-- 1. Update is_admin()
-- Returns TRUE if user is 'admin' OR 'developer'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' IN ('admin', 'developer')));
END;
$$;

-- 2. Update is_organizer()
-- Returns TRUE if user is 'organizer' OR 'developer'
-- (Note: admin is separate generally, but usually admin implies organizer rights. 
-- However, is_organizer_or_admin handles the combination. 
-- We include developer here to be safe for policies that check only is_organizer)
CREATE OR REPLACE FUNCTION is_organizer()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' IN ('organizer', 'developer')));
END;
$$;

-- 3. Update is_organizer_or_admin()
-- This function relies on the above two, but we can make it explicit or leave as is.
-- Existing implementation: RETURN is_admin() OR is_organizer();
-- Since we updated is_admin() and is_organizer() to return true for developer, 
-- this function will now return TRUE for developer.
-- No change needed, but re-declaring to ensure consistency if logic changes.
CREATE OR REPLACE FUNCTION is_organizer_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN is_admin() OR is_organizer();
END;
$$;

-- 4. New Function: is_developer()
-- Checks specifically for 'developer' role.
CREATE OR REPLACE FUNCTION is_developer()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
BEGIN
  RETURN (SELECT auth.uid() = ANY (SELECT id FROM auth.users WHERE raw_user_meta_data->>'user_role' = 'developer'));
END;
$$;
