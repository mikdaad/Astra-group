/**
 * Profile Setup Local Storage Service
 * Manages localStorage operations for profile setup flow and user data
 */

// Type definitions
export interface UserProfile {
  id: string;
  full_name: string;
  phone_number?: string;
  phone_verified?: boolean;
  country?: string;
  state?: string;
  district?: string;
  street_address?: string;
  postal_code?: string;
  referral_code?: string;
  referred_by_user_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  initial_scheme_id?: string;
}

export interface UserSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email?: string;
    phone?: string;
  };
}

export type ProfileSetupStep = 'location' | 'address' | 'profile' | 'registration_fee';
export type SetupMilestone = 'profile_form' | 'issuing_card' | 'registration_fee'

// Storage keys
const STORAGE_KEYS = {
  USER: 'user',
  SESSION: 'session',
  USER_PROFILE: 'user_profile',
  MISSING_PROFILE_STEPS: 'missingProfileSteps',
  PROFILE_SETUP_IN_PROGRESS: 'profileSetupInProgress',
  COMPLETED_SETUP_MILESTONES: 'completedSetupMilestones',
} as const;

/**
 * Profile Setup Data Management
 */
export const profileSetupStorage = {
  /**
   * Check profile completion status from database via API
   * This is the preferred method for checking profile completion
   */
  async checkCompletionFromDatabase(): Promise<{
    isComplete: boolean;
    missingSteps: ProfileSetupStep[];
    details?: {
      hasLocation: boolean;
      hasAddress: boolean;
      hasScheme: boolean;
      hasRegistrationFee: boolean;
    };
  } | null> {
    try {
      const response = await fetch('/api/profile/check-completion', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn('Failed to check profile completion from database:', response.status);
        return null;
      }

      const result = await response.json();
      
      if (!result.success) {
        console.warn('Profile completion check failed:', result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.warn('Error checking profile completion from database:', error);
      return null;
    }
  },

  /**
   * Sync localStorage with database state
   * This ensures localStorage reflects the actual database state
   */
  async syncWithDatabase(): Promise<boolean> {
    try {
      const dbStatus = await this.checkCompletionFromDatabase();
      
      if (!dbStatus) {
        console.warn('Could not sync with database - API call failed');
        return false;
      }

      if (dbStatus.isComplete) {
        // Profile is complete - clear localStorage
        this.completeSetup();
        console.log('✅ Synced with database: Profile complete, localStorage cleared');
      } else {
        // Profile incomplete - update localStorage with current missing steps
        this.setMissingSteps(dbStatus.missingSteps);
        console.log('📝 Synced with database: Updated missing steps:', dbStatus.missingSteps);
      }

      return true;
    } catch (error) {
      console.warn('Error syncing with database:', error);
      return false;
    }
  },

  /**
   * Set missing profile steps for dynamic step flow
   */
  setMissingSteps(steps: ProfileSetupStep[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MISSING_PROFILE_STEPS, JSON.stringify(steps));
      localStorage.setItem(STORAGE_KEYS.PROFILE_SETUP_IN_PROGRESS, 'true');
    } catch (error) {
      console.warn('Failed to store missing profile steps:', error);
    }
  },

  /**
   * Get missing profile steps
   * WARNING: This returns localStorage data only. For accurate data, use checkCompletionFromDatabase() first
   */
  getMissingSteps(): ProfileSetupStep[] {
    try {
      const steps = localStorage.getItem(STORAGE_KEYS.MISSING_PROFILE_STEPS);
      return steps ? JSON.parse(steps) : ['location', 'address', 'profile','registration_fee'];
    } catch (error) {
      console.warn('Failed to parse missing profile steps:', error);
      return ['location', 'address', 'profile','registration_fee'];
    }
  },

  /**
   * Check if profile setup is in progress
   * WARNING: This checks localStorage only. For accurate status, use checkCompletionFromDatabase() first
   */
  isSetupInProgress(): boolean {
    return localStorage.getItem(STORAGE_KEYS.PROFILE_SETUP_IN_PROGRESS) === 'true';
  },

  /**
   * Mark profile setup as completed and clean up related data
   * Use this when profile is verified as complete from database
   */
  completeSetup(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.MISSING_PROFILE_STEPS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_SETUP_IN_PROGRESS);
      console.log('Profile setup localStorage data cleaned up');
    } catch (error) {
      console.warn('Failed to clean up profile setup data:', error);
    }
  },

  /**
   * Remove a specific step from the missing steps list (mark as done)
   * WARNING: This only updates localStorage. Database verification is recommended
   */
  markStepDone(step: ProfileSetupStep): void {
    try {
      const steps = this.getMissingSteps();
      const next = steps.filter((s) => s !== step);
      localStorage.setItem(STORAGE_KEYS.MISSING_PROFILE_STEPS, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to mark step done:', error);
    }
  },
};

/**
 * User Profile Cache Management
 */
export const userProfileStorage = {
  /**
   * Cache user profile data
   */
  setProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to cache user profile:', error);
    }
  },

  /**
   * Get cached user profile
   */
  getProfile(): UserProfile | null {
    try {
      const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.warn('Failed to parse cached user profile:', error);
      return null;
    }
  },

  /**
   * Update specific profile fields
   */
  updateProfile(updates: Partial<UserProfile>): void {
    try {
      const currentProfile = this.getProfile();
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, ...updates };
        this.setProfile(updatedProfile);
      }
    } catch (error) {
      console.warn('Failed to update cached user profile:', error);
    }
  },

  /**
   * Clear cached profile data
   */
  clearProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.warn('Failed to clear cached user profile:', error);
    }
  },
};

/**
 * User Session Management
 */
export const userSessionStorage = {
  /**
   * Set user authentication data
   */
  setUser(user: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to store user data:', error);
    }
  },

  /**
   * Get user authentication data
   */
  getUser(): any | null {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.warn('Failed to parse user data:', error);
      return null;
    }
  },

  /**
   * Set session data
   */
  setSession(session: UserSession): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to store session data:', error);
    }
  },

  /**
   * Get session data
   */
  getSession(): UserSession | null {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.warn('Failed to parse session data:', error);
      return null;
    }
  },

  /**
   * Clear all user authentication data
   */
  clearAuth(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  },
};

/**
 * General Storage Cleanup
 */
export const storageCleanup = {
  /**
   * Clean up all profile setup related data
   */
  cleanupProfileSetup(): void {
    profileSetupStorage.completeSetup();
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_SETUP_MILESTONES);
    } catch (error) {
      console.warn('Failed to clear completed milestones:', error);
    }
  },

  /**
   * Clean up all authentication data (logout)
   */
  cleanupAuth(): void {
    userSessionStorage.clearAuth();
    userProfileStorage.clearProfile();
    profileSetupStorage.completeSetup();
  },

  /**
   * Clean up expired or stale data
   */
  cleanupStaleData(): void {
    try {
      const session = userSessionStorage.getSession();
      if (session && session.expires_at && Date.now() > session.expires_at * 1000) {
        console.log('Session expired, cleaning up auth data');
        this.cleanupAuth();
      }
    } catch (error) {
      console.warn('Failed to cleanup stale data:', error);
    }
  },
};

/**
 * Initialize storage service
 * Run cleanup on app start to remove stale data
 */
export const initializeStorage = (): void => {
  storageCleanup.cleanupStaleData();
};

/**
 * Setup Milestone Completion Tracking
 * Tracks non-core steps like profile form submit, issuing card, and registration fee
 */
export const setupMilestoneStorage = {
  getCompleted(): SetupMilestone[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_SETUP_MILESTONES);
      return raw ? (JSON.parse(raw) as SetupMilestone[]) : [];
    } catch (error) {
      console.warn('Failed to read completed setup milestones:', error);
      return [];
    }
  },

  isCompleted(milestone: SetupMilestone): boolean {
    return this.getCompleted().includes(milestone);
  },

  markCompleted(milestone: SetupMilestone): void {
    try {
      const all = this.getCompleted();
      if (!all.includes(milestone)) {
        const next = [...all, milestone];
        localStorage.setItem(STORAGE_KEYS.COMPLETED_SETUP_MILESTONES, JSON.stringify(next));
      }
    } catch (error) {
      console.warn('Failed to persist completed setup milestone:', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_SETUP_MILESTONES);
    } catch (error) {
      console.warn('Failed to clear completed setup milestones:', error);
    }
  },
};
