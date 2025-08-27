// Staff Management Types

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  roles: StaffRole[];
  status: 'active' | 'inactive' | 'suspended';
  department: string;
  joiningDate: string;
  lastLoginDate?: string;
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  managedBy?: string; // Staff ID of manager
  permissions: Permission[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffRole {
  id: string;
  name: 'admin' | 'support' | 'new' | 'manager';
  assignedDate: string;
  assignedBy: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  module: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  granted: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headOfDepartment?: string;
  staffCount: number;
}

// Statistics types
export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  suspendedStaff: number;
  adminCount: number;
  supportCount: number;
  managerCount: number;
  newStaffCount: number;
  departmentCount: number;
  avgStaffPerDepartment: number;
}

// Filter and search types
export interface StaffFilters {
  roles?: StaffRole['name'][];
  status?: Staff['status'][];
  departments?: string[];
  joiningDateFrom?: string;
  joiningDateTo?: string;
  hasManager?: boolean;
  search?: string;
}

// Form types
export interface CreateStaffRequest {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  roles: StaffRole['name'][];
  status: Staff['status'];
  department: string;
  joiningDate: string;
  managedBy?: string;
  address?: string;
  emergencyContact?: Staff['emergencyContact'];
  permissions: Omit<Permission, 'id'>[];
  notes?: string;
}

export interface UpdateStaffRequest extends Partial<CreateStaffRequest> {
  id: string;
}

export interface AssignRoleRequest {
  staffId: string;
  roleName: StaffRole['name'];
  assignedBy: string;
}

export interface RemoveRoleRequest {
  staffId: string;
  roleId: string;
  removedBy: string;
  reason?: string;
}

// API Response types
export interface StaffListResponse {
  staff: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: StaffStats;
  departments: Department[];
}

export interface StaffDetailsResponse {
  staff: Staff;
  directReports: Staff[];
  recentActivities: StaffActivity[];
  performanceMetrics?: StaffPerformance;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  action: string;
  description: string;
  module: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface StaffPerformance {
  tasksCompleted: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  lastMonthPerformance: {
    tasksCompleted: number;
    improvement: number;
  };
}

// Constants
export const STAFF_ROLES: Record<StaffRole['name'], { 
  label: string; 
  color: string; 
  description: string;
  level: number;
}> = {
  new: { 
    label: 'New Staff', 
    color: 'blue', 
    description: 'Recently joined staff with basic permissions',
    level: 1
  },
  support: { 
    label: 'Support', 
    color: 'green', 
    description: 'Customer support and assistance team',
    level: 2
  },
  manager: { 
    label: 'Manager', 
    color: 'purple', 
    description: 'Team manager with supervisory permissions',
    level: 3
  },
  admin: { 
    label: 'Admin', 
    color: 'red', 
    description: 'Full administrative access and control',
    level: 4
  }
};

export const STAFF_STATUSES: Record<Staff['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'green' },
  inactive: { label: 'Inactive', color: 'gray' },
  suspended: { label: 'Suspended', color: 'red' }
};

export const DEPARTMENTS = [
  'Administration',
  'Customer Support',
  'Finance',
  'Technology',
  'Marketing',
  'Sales',
  'Human Resources',
  'Operations'
];

export const DEFAULT_PERMISSIONS: Record<StaffRole['name'], Permission[]> = {
  new: [
    { id: '1', module: 'dashboard', action: 'read', granted: true },
    { id: '2', module: 'profile', action: 'read', granted: true },
    { id: '3', module: 'profile', action: 'write', granted: true }
  ],
  support: [
    { id: '1', module: 'dashboard', action: 'read', granted: true },
    { id: '2', module: 'users', action: 'read', granted: true },
    { id: '3', module: 'cards', action: 'read', granted: true },
    { id: '4', module: 'support', action: 'read', granted: true },
    { id: '5', module: 'support', action: 'write', granted: true },
    { id: '6', module: 'profile', action: 'read', granted: true },
    { id: '7', module: 'profile', action: 'write', granted: true }
  ],
  manager: [
    { id: '1', module: 'dashboard', action: 'read', granted: true },
    { id: '2', module: 'users', action: 'read', granted: true },
    { id: '3', module: 'users', action: 'write', granted: true },
    { id: '4', module: 'cards', action: 'read', granted: true },
    { id: '5', module: 'cards', action: 'write', granted: true },
    { id: '6', module: 'schemes', action: 'read', granted: true },
    { id: '7', module: 'schemes', action: 'write', granted: true },
    { id: '8', module: 'support', action: 'read', granted: true },
    { id: '9', module: 'support', action: 'write', granted: true },
    { id: '10', module: 'staff', action: 'read', granted: true },
    { id: '11', module: 'reports', action: 'read', granted: true }
  ],
  admin: [
    { id: '1', module: 'dashboard', action: 'admin', granted: true },
    { id: '2', module: 'users', action: 'admin', granted: true },
    { id: '3', module: 'cards', action: 'admin', granted: true },
    { id: '4', module: 'schemes', action: 'admin', granted: true },
    { id: '5', module: 'support', action: 'admin', granted: true },
    { id: '6', module: 'staff', action: 'admin', granted: true },
    { id: '7', module: 'settings', action: 'admin', granted: true },
    { id: '8', module: 'reports', action: 'admin', granted: true },
    { id: '9', module: 'finance', action: 'admin', granted: true }
  ]
};

// Utility types
export type StaffFormData = Omit<Staff, 'id' | 'createdAt' | 'updatedAt' | 'permissions'>;
export type RoleAssignmentData = {
  roles: StaffRole['name'][];
  assignedBy: string;
  notes?: string;
};
