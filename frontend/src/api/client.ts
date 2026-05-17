import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

const ACCESS_KEY = 'mv:accessToken'
const REFRESH_KEY = 'mv:refreshToken'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Auto-refresh on 401 ──────────────────────────────────────────────────────

type Subscriber = (token: string | null) => void

let isRefreshing = false
let subscribers: Subscriber[] = []

function onRefreshed(token: string | null) {
  subscribers.forEach((cb) => cb(token))
  subscribers = []
}

function subscribeToRefresh(cb: Subscriber) {
  subscribers.push(cb)
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    )
    const { accessToken, refreshToken: newRefresh } = res.data as {
      accessToken: string
      refreshToken: string
    }
    setTokens(accessToken, newRefresh)
    return accessToken
  } catch {
    clearTokens()
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((token) => {
          if (!token) {
            reject(error)
            return
          }
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    isRefreshing = true
    const newToken = await performRefresh()
    isRefreshing = false
    onRefreshed(newToken)

    if (!newToken) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(error)
    }

    original.headers.Authorization = `Bearer ${newToken}`
    return apiClient(original)
  },
)
