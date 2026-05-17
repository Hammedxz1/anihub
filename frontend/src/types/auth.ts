export interface User {
  id: string
  email: string
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  bio?: string | null
  favoriteGenres?: string[]
  publicProfile?: boolean
  subscriptionStatus: 'free' | 'premium' | 'pro' | 'past_due' | string
  subscriptionEndDate?: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}
