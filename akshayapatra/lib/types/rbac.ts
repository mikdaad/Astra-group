export type Role = 'superadmin' | 'admin' | 'support' | 'manager' | 'new'

export interface StaffProfile {
  id: string
  full_name: string
  phone_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  role: Role
}

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface RolePermissions {
  role: Role
  permissions: string[]
  pages: string[]
  api_endpoints: string[]
}

// Define all possible permissions
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  
  // User Management
  USERS_VIEW: 'users:view',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  
  // Staff Management
  STAFF_VIEW: 'staff:view',
  STAFF_EDIT: 'staff:edit',
  STAFF_DELETE: 'staff:delete',
  STAFF_ROLES: 'staff:roles',
  
  // Schemes
  SCHEMES_VIEW: 'schemes:view',
  SCHEMES_EDIT: 'schemes:edit',
  SCHEMES_DELETE: 'schemes:delete',
  
  // Cards
  CARDS_VIEW: 'cards:view',
  CARDS_EDIT: 'cards:edit',
  CARDS_ISSUE: 'cards:issue',
  
  // Financial
  INCOME_VIEW: 'income:view',
  INCOME_EDIT: 'income:edit',
  
  // Referrals
  REFERRALS_VIEW: 'referrals:view',
  REFERRALS_EDIT: 'referrals:edit',
  REFERRALS_SETTINGS: 'referrals:settings',
  REFERRALS_LEVELS_MANAGE: 'referrals:levels:manage',
  
  // Support
  SUPPORT_VIEW: 'support:view',
  SUPPORT_RESPOND: 'support:respond',
  SUPPORT_ADMIN: 'support:admin',

  // Winners
  WINNERS_VIEW: 'winners:view',
  WINNERS_EDIT: 'winners:edit',
  WINNERS_DELETE: 'winners:delete',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_ADMIN: 'settings:admin',
  
  // Profile
  PROFILE_VIEW: 'profile:view',
  PROFILE_EDIT: 'profile:edit',
} as const

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  superadmin: {
    role: 'superadmin',
    permissions: Object.values(PERMISSIONS),
    pages: [
      '/admin',
      '/admin/schemes',
      '/admin/cards', 
      '/admin/users',
      '/admin/income',
      '/admin/referrals',
      '/admin/referrals/settings',
      '/admin/staff',
      '/admin/support',
      '/admin/profile',
      '/admin/settings'
    ],
    api_endpoints: [
      '/api/admin/*'
    ]
  },
  
  admin: {
    role: 'admin',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.SCHEMES_VIEW,
      PERMISSIONS.SCHEMES_EDIT,
      PERMISSIONS.SCHEMES_DELETE,
      PERMISSIONS.CARDS_VIEW,
      PERMISSIONS.CARDS_EDIT,
      PERMISSIONS.CARDS_ISSUE,
      PERMISSIONS.INCOME_VIEW,
      PERMISSIONS.INCOME_EDIT,
      PERMISSIONS.REFERRALS_VIEW,
      PERMISSIONS.REFERRALS_EDIT,
      PERMISSIONS.REFERRALS_SETTINGS,
      PERMISSIONS.REFERRALS_LEVELS_MANAGE,
      PERMISSIONS.SUPPORT_VIEW,
      PERMISSIONS.SUPPORT_RESPOND,
      PERMISSIONS.WINNERS_VIEW,
      PERMISSIONS.SUPPORT_ADMIN,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.PROFILE_EDIT,
    ],
    pages: [
      '/admin',
      '/admin/schemes',
      '/admin/cards',
      '/admin/users', 
      '/admin/income',
      '/admin/referrals',
      '/admin/referrals/settings',
      '/admin/winners',
      '/admin/support',
      '/admin/profile',
      '/admin/settings'
    ],
    api_endpoints: [
      '/api/admin/users/*',
      '/api/admin/schemes/*',
      '/api/admin/cards/*',
      '/api/admin/income/*',
      '/api/admin/referrals/*',
      '/api/admin/support/*'
    ]
  },
  
  support: {
    role: 'support',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.SCHEMES_VIEW,
      PERMISSIONS.CARDS_VIEW,
      PERMISSIONS.INCOME_VIEW,
      PERMISSIONS.REFERRALS_VIEW,
      PERMISSIONS.SUPPORT_VIEW,
      PERMISSIONS.SUPPORT_RESPOND,
      PERMISSIONS.WINNERS_VIEW,
      PERMISSIONS.WINNERS_EDIT,
      PERMISSIONS.WINNERS_DELETE,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.PROFILE_EDIT,
    ],
    pages: [
      '/admin',
      '/admin/schemes',
      '/admin/cards',
      '/admin/users',
      '/admin/income', 
      '/admin/referrals',
      '/admin/winners',
      '/admin/support',
      '/admin/profile',
      '/admin/settings'
    ],
    api_endpoints: [
      '/api/admin/support/*',
      '/api/admin/users/view',
      '/api/admin/cards/view'
    ]
  },
  
  manager: {
    role: 'manager',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.SCHEMES_VIEW,
      PERMISSIONS.SCHEMES_EDIT,
      PERMISSIONS.CARDS_VIEW,
      PERMISSIONS.CARDS_EDIT,
      PERMISSIONS.INCOME_VIEW,
      PERMISSIONS.REFERRALS_VIEW,
      PERMISSIONS.REFERRALS_EDIT,
      PERMISSIONS.SUPPORT_VIEW,
      PERMISSIONS.SUPPORT_RESPOND,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.PROFILE_EDIT,
    ],
    pages: [
      '/admin',
      '/admin/schemes',
      '/admin/cards',
      '/admin/users',
      '/admin/income',
      '/admin/referrals',
      '/admin/winners',
      '/admin/support',
      '/admin/profile',
      '/admin/settings'
    ],
    api_endpoints: [
      '/api/admin/users/*',
      '/api/admin/schemes/view',
      '/api/admin/schemes/edit',
      '/api/admin/cards/*',
      '/api/admin/referrals/*',
      '/api/admin/support/*'
    ]
  },
  
  new: {
    role: 'new',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.PROFILE_EDIT,
    ],
    pages: [
      '/admin',
      '/admin/profile',
      '/admin/settings'
    ],
    api_endpoints: [
      '/api/admin/profile/*'
    ]
  }
}

export const ADMIN_PAGES = [
  '/admin',
  '/admin/schemes', 
  '/admin/cards',
  '/admin/users',
  '/admin/income',
  '/admin/referrals',
  '/admin/staff',
  '/admin/winners',
  '/admin/support',
  '/admin/profile',
  '/admin/settings'
] as const
