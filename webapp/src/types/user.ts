// export type UserRole = 'advocate' | 'admin'
// src/types/userRole.ts
import { 
  User as PrismaUser,
  UserRole as PrismaUserRole
} from '@prisma/client';

// Re-export Prisma enum
export type { UserRole } from '@prisma/client';

// User preferences structure (stored in JSON field)
export interface UserPreferences {
  autoSync?: boolean; // Changed from auto_sync
  notificationEmail?: boolean; // Changed from notification_email
  notificationPush?: boolean; // Changed from notification_push
  theme?: 'light' | 'dark' | 'system';
  dashboardLayout?: 'grid' | 'list'; // Changed from dashboard_layout
  language?: 'en' | 'ml' | 'hi';
  timezone?: string;
}

// Extend Prisma's User type
export interface User extends PrismaUser {
  preferences: UserPreferences; // Override to use typed preferences
  // Optional computed/virtual fields
  displayName?: string;
  initials?: string;
}

// Type for user creation (without generated fields)
export interface CreateUserInput {
  email: string;
  mobile?: string;
  passwordHash: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  khcEnrollmentNumber?: string;
  role?: PrismaUserRole;
  preferences?: UserPreferences;
}

// Type for user update
export interface UpdateUserInput {
  email?: string;
  mobile?: string;
  khcAdvocateName?: string;
  khcEnrollmentNumber?: string;
  isActive?: boolean;
  isVerified?: boolean;
  preferences?: Partial<UserPreferences>;
}

// User with related data (for detailed views)
export interface UserWithRelations extends User {
  _count?: {
    cases: number;
    aiAnalyses: number;
    subscriptions: number;
  };
  activeSubscription?: {
    plan: string;
    status: string;
    endDate: Date | string;
  } | null;
}

// Type for public user info (safe to expose in API)
export interface PublicUser {
  id: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  khcEnrollmentNumber?: string;
  role: PrismaUserRole;
  isVerified: boolean;
}

// Session/auth user type
export interface AuthUser {
  id: string;
  email: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  role: PrismaUserRole;
  isActive: boolean;
  isVerified: boolean;
  preferences: UserPreferences;
}

// Type guards
export function isUserPreferences(obj: any): obj is UserPreferences {
  return obj && typeof obj === 'object';
}

export function parseUserPreferences(json: any): UserPreferences {
  if (!json) return {};
  
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return isUserPreferences(data) ? data : {};
  } catch (error) {
    console.error('Failed to parse user preferences:', error);
    return {};
  }
}

// Helper to get user display name
export function getUserDisplayName(user: User | AuthUser): string {
  return user.khcAdvocateName || user.email.split('@')[0];
}

// Helper to get user initials
export function getUserInitials(user: User | AuthUser): string {
  const name = user.khcAdvocateName;
  if (!name) return user.email.charAt(0).toUpperCase();
  
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  autoSync: true,
  notificationEmail: true,
  notificationPush: false,
  theme: 'system',
  dashboardLayout: 'grid',
  language: 'en',
  timezone: 'Asia/Kolkata'
};

// export interface User {
//   id: string
//   email: string
//   mobile?: string
//   khc_advocate_id: string
//   khc_advocate_name: string
//   khc_enrollment_number?: string
//   role: UserRole
//   is_active: boolean
//   is_verified: boolean
//   created_at: string
//   updated_at: string
//   last_login_at?: string
//   last_sync_at?: string
//   preferences: UserPreferences
// }

// export interface UserPreferences {
//   auto_sync?: boolean
//   notification_email?: boolean
//   notification_push?: boolean
//   theme?: 'light' | 'dark' | 'system'
//   dashboard_layout?: 'grid' | 'list'
// }