-- Role Configuration System Database Schema
-- This schema allows for database-driven role and permission management

-- 1. Role Configurations Table
CREATE TABLE public.role_configurations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  role_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  hierarchy_level integer NOT NULL DEFAULT 0,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  accessible_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  api_endpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_system_role boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.user_profiles(id),
  
  CONSTRAINT role_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT role_configurations_role_name_check CHECK (role_name ~ '^[a-z_]+$'),
  CONSTRAINT role_configurations_hierarchy_level_check CHECK (hierarchy_level >= 0)
);

-- 2. Custom Permissions Table
CREATE TABLE public.custom_permissions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  permission_key text NOT NULL UNIQUE,
  resource text NOT NULL,
  action text NOT NULL,
  display_name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT custom_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT custom_permissions_permission_key_check CHECK (permission_key ~ '^[a-z_]+:[a-z_]+$'),
  CONSTRAINT custom_permissions_resource_action_unique UNIQUE (resource, action)
);

-- 3. User Role Assignments Table
CREATE TABLE public.user_role_assignments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_config_id uuid NOT NULL REFERENCES public.role_configurations(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.user_profiles(id),
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  custom_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_assignments_user_active_unique UNIQUE (user_id, role_config_id) WHERE is_active = true
);

-- 4. Role Permission History Table (for audit trail)
CREATE TABLE public.role_permission_history (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  role_config_id uuid NOT NULL REFERENCES public.role_configurations(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'created', 'updated', 'deleted'
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES public.user_profiles(id),
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT role_permission_history_pkey PRIMARY KEY (id),
  CONSTRAINT role_permission_history_action_check CHECK (action IN ('created', 'updated', 'deleted'))
);

-- Indexes for performance
CREATE INDEX idx_role_configurations_active ON public.role_configurations(is_active);
CREATE INDEX idx_role_configurations_hierarchy ON public.role_configurations(hierarchy_level);
CREATE INDEX idx_custom_permissions_active ON public.custom_permissions(is_active);
CREATE INDEX idx_custom_permissions_category ON public.custom_permissions(category);
CREATE INDEX idx_user_role_assignments_user ON public.user_role_assignments(user_id, is_active);
CREATE INDEX idx_user_role_assignments_role ON public.user_role_assignments(role_config_id, is_active);
CREATE INDEX idx_role_permission_history_role ON public.role_permission_history(role_config_id, changed_at DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_role_configurations_updated_at 
    BEFORE UPDATE ON public.role_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_permissions_updated_at 
    BEFORE UPDATE ON public.custom_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system roles
INSERT INTO public.role_configurations (
  role_name, 
  display_name, 
  description, 
  hierarchy_level, 
  permissions, 
  accessible_pages, 
  api_endpoints, 
  is_system_role
) VALUES 
(
  'new',
  'New Staff',
  'Basic access for new staff members',
  1,
  '["dashboard:view", "settings:view", "profile:view", "profile:edit"]'::jsonb,
  '["/admin", "/admin/profile", "/admin/settings"]'::jsonb,
  '["/api/admin/profile/*"]'::jsonb,
  true
),
(
  'support',
  'Support Staff',
  'Read-only access to most features for customer support',
  2,
  '["dashboard:view", "users:view", "schemes:view", "cards:view", "income:view", "referrals:view", "support:view", "support:respond", "settings:view", "profile:view", "profile:edit"]'::jsonb,
  '["/admin", "/admin/schemes", "/admin/cards", "/admin/users", "/admin/income", "/admin/referrals", "/admin/support", "/admin/profile", "/admin/settings"]'::jsonb,
  '["/api/admin/support/*", "/api/admin/users/view", "/api/admin/cards/view"]'::jsonb,
  true
),
(
  'manager',
  'Manager',
  'Can edit most content but no staff management',
  3,
  '["dashboard:view", "users:view", "users:edit", "schemes:view", "schemes:edit", "cards:view", "cards:edit", "income:view", "referrals:view", "referrals:edit", "support:view", "support:respond", "settings:view", "profile:view", "profile:edit"]'::jsonb,
  '["/admin", "/admin/schemes", "/admin/cards", "/admin/users", "/admin/income", "/admin/referrals", "/admin/support", "/admin/profile", "/admin/settings"]'::jsonb,
  '["/api/admin/users/*", "/api/admin/schemes/view", "/api/admin/schemes/edit", "/api/admin/cards/*", "/api/admin/referrals/*", "/api/admin/support/*"]'::jsonb,
  true
),
(
  'admin',
  'Administrator',
  'Full access except staff management',
  4,
  '["dashboard:view", "users:view", "users:edit", "users:delete", "schemes:view", "schemes:edit", "schemes:delete", "cards:view", "cards:edit", "cards:issue", "income:view", "income:edit", "referrals:view", "referrals:edit", "support:view", "support:respond", "support:admin", "settings:view", "settings:edit", "profile:view", "profile:edit"]'::jsonb,
  '["/admin", "/admin/schemes", "/admin/cards", "/admin/users", "/admin/income", "/admin/referrals", "/admin/support", "/admin/profile", "/admin/settings"]'::jsonb,
  '["/api/admin/users/*", "/api/admin/schemes/*", "/api/admin/cards/*", "/api/admin/income/*", "/api/admin/referrals/*", "/api/admin/support/*"]'::jsonb,
  true
),
(
  'superadmin',
  'Super Administrator',
  'Complete system access including staff management',
  5,
  '["dashboard:view", "users:view", "users:edit", "users:delete", "staff:view", "staff:edit", "staff:delete", "staff:roles", "schemes:view", "schemes:edit", "schemes:delete", "cards:view", "cards:edit", "cards:issue", "income:view", "income:edit", "referrals:view", "referrals:edit", "support:view", "support:respond", "support:admin", "settings:view", "settings:edit", "settings:admin", "profile:view", "profile:edit"]'::jsonb,
  '["/admin", "/admin/schemes", "/admin/cards", "/admin/users", "/admin/income", "/admin/referrals", "/admin/staff", "/admin/support", "/admin/profile", "/admin/settings"]'::jsonb,
  '["/api/admin/*"]'::jsonb,
  true
);

-- Insert default custom permissions
INSERT INTO public.custom_permissions (
  permission_key,
  resource,
  action,
  display_name,
  description,
  category
) VALUES 
('dashboard:view', 'dashboard', 'view', 'View Dashboard', 'Access to admin dashboard', 'dashboard'),
('users:view', 'users', 'view', 'View Users', 'View user profiles and data', 'user_management'),
('users:edit', 'users', 'edit', 'Edit Users', 'Modify user profiles and data', 'user_management'),
('users:delete', 'users', 'delete', 'Delete Users', 'Remove users from system', 'user_management'),
('staff:view', 'staff', 'view', 'View Staff', 'View staff member profiles', 'staff_management'),
('staff:edit', 'staff', 'edit', 'Edit Staff', 'Modify staff member profiles', 'staff_management'),
('staff:delete', 'staff', 'delete', 'Delete Staff', 'Remove staff members', 'staff_management'),
('staff:roles', 'staff', 'roles', 'Manage Staff Roles', 'Assign and modify staff roles', 'staff_management'),
('schemes:view', 'schemes', 'view', 'View Schemes', 'View lottery and investment schemes', 'schemes'),
('schemes:edit', 'schemes', 'edit', 'Edit Schemes', 'Modify scheme configurations', 'schemes'),
('schemes:delete', 'schemes', 'delete', 'Delete Schemes', 'Remove schemes from system', 'schemes'),
('cards:view', 'cards', 'view', 'View Cards', 'View user cards and transactions', 'cards'),
('cards:edit', 'cards', 'edit', 'Edit Cards', 'Modify card configurations', 'cards'),
('cards:issue', 'cards', 'issue', 'Issue Cards', 'Create new cards for users', 'cards'),
('income:view', 'income', 'view', 'View Income', 'View financial reports and income', 'financial'),
('income:edit', 'income', 'edit', 'Edit Income', 'Modify income records', 'financial'),
('referrals:view', 'referrals', 'view', 'View Referrals', 'View referral networks', 'referrals'),
('referrals:edit', 'referrals', 'edit', 'Edit Referrals', 'Modify referral configurations', 'referrals'),
('support:view', 'support', 'view', 'View Support', 'View support tickets', 'support'),
('support:respond', 'support', 'respond', 'Respond to Support', 'Reply to support tickets', 'support'),
('support:admin', 'support', 'admin', 'Admin Support', 'Manage support system', 'support'),
('settings:view', 'settings', 'view', 'View Settings', 'View system settings', 'settings'),
('settings:edit', 'settings', 'edit', 'Edit Settings', 'Modify system settings', 'settings'),
('settings:admin', 'settings', 'admin', 'Admin Settings', 'Manage system configuration', 'settings'),
('profile:view', 'profile', 'view', 'View Profile', 'View own profile', 'profile'),
('profile:edit', 'profile', 'edit', 'Edit Profile', 'Modify own profile', 'profile');

-- Row Level Security (RLS) Policies
ALTER TABLE public.role_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission_history ENABLE ROW LEVEL SECURITY;

-- Policies for role_configurations
CREATE POLICY "Allow superadmin full access to role_configurations" ON public.role_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_role_assignments ura
      JOIN public.role_configurations rc ON ura.role_config_id = rc.id
      WHERE ura.user_id = auth.uid() 
      AND ura.is_active = true
      AND rc.role_name = 'superadmin'
    )
  );

CREATE POLICY "Allow read access to active role_configurations" ON public.role_configurations
  FOR SELECT USING (is_active = true);

-- Policies for custom_permissions
CREATE POLICY "Allow superadmin full access to custom_permissions" ON public.custom_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_role_assignments ura
      JOIN public.role_configurations rc ON ura.role_config_id = rc.id
      WHERE ura.user_id = auth.uid() 
      AND ura.is_active = true
      AND rc.role_name = 'superadmin'
    )
  );

CREATE POLICY "Allow read access to active custom_permissions" ON public.custom_permissions
  FOR SELECT USING (is_active = true);

-- Policies for user_role_assignments
CREATE POLICY "Allow superadmin full access to user_role_assignments" ON public.user_role_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_role_assignments ura
      JOIN public.role_configurations rc ON ura.role_config_id = rc.id
      WHERE ura.user_id = auth.uid() 
      AND ura.is_active = true
      AND rc.role_name = 'superadmin'
    )
  );

CREATE POLICY "Allow users to view their own role assignments" ON public.user_role_assignments
  FOR SELECT USING (user_id = auth.uid());

-- Policies for role_permission_history
CREATE POLICY "Allow superadmin full access to role_permission_history" ON public.role_permission_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_role_assignments ura
      JOIN public.role_configurations rc ON ura.role_config_id = rc.id
      WHERE ura.user_id = auth.uid() 
      AND ura.is_active = true
      AND rc.role_name = 'superadmin'
    )
  );

CREATE POLICY "Allow read access to role_permission_history" ON public.role_permission_history
  FOR SELECT USING (true);
