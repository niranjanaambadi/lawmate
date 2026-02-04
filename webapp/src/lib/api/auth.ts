// import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api'
// import type { User } from '@/types/user'
// import apiClient from './client'

// export const authApi = {
//   async login(credentials: LoginRequest): Promise<LoginResponse> {
//     const { data } = await apiClient.post('/api/v1/auth/login', credentials)
    
//     // Backend returns: { access_token, token_type, user }
//     // Transform to match our expected structure
//     return {
//       access_token: data.access_token,
//       refresh_token: data.refresh_token || data.access_token, // Use same token if no refresh
//       token_type: data.token_type || "bearer",
//       user: data.user
//     }
//   },

//   async register(userData: RegisterRequest): Promise<User> {
//     const { data } = await apiClient.post('/api/v1/auth/register', userData)
//     return data
//   },

//   async getCurrentUser(): Promise<User> {
//     const { data } = await apiClient.get('/api/v1/auth/me')
//     return data
//   },

//   async logout(): Promise<void> {
//     await apiClient.post('/api/v1/auth/logout')
//   },
// }
import type { LoginRequest, RegisterRequest } from '@/types/api'
import type { User } from '@/types/user'
import apiClient from './client'

// Response from backend
interface BackendLoginResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  user: {
    id: string
    email: string
    khc_advocate_id: string
    khc_advocate_name: string
  }
}

// Transform to NextAuth expected format
export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    id: string
    email: string
    khc_advocate_id: string
    khc_advocate_name: string
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<BackendLoginResponse>(
      '/api/v1/auth/login',
      credentials
    )

    // Ensure refresh_token exists
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || data.access_token,
      token_type: data.token_type || 'bearer',
      user: data.user,
    }
  },

  async register(userData: RegisterRequest): Promise<User> {
    const { data } = await apiClient.post('/api/v1/auth/register', userData)
    return data
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get('/api/v1/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout')
  },
}