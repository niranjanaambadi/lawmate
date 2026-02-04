// export type UserRole = 'advocate' | 'admin'

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
export type UserRole = 'advocate' | 'admin'

export interface User {
  id: string
  email: string
  mobile?: string
  khc_advocate_id: string
  khc_advocate_name: string
  khc_enrollment_number?: string
  role: UserRole
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
  last_sync_at?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  auto_sync?: boolean
  notification_email?: boolean
  notification_push?: boolean
  theme?: 'light' | 'dark' | 'system'
  dashboard_layout?: 'grid' | 'list'
}