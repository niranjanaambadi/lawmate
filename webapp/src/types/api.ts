
import { User } from "./user"
// Base API response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  detail: string
  status_code: number
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string  // Make sure this is NOT optional
  token_type: string
  user: User
}

export interface RegisterRequest {
  email: string
  mobile: string
  password: string
  khc_advocate_id: string
  khc_advocate_name: string
  khc_enrollment_number?: string
}
