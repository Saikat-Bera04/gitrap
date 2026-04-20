"use client"

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } }

export type ContributionStats = {
  commits: number
  pullRequests: number
  issues: number
  stars: number
  repositories: number
  updatedAt?: string
}

export type UserProfile = {
  id: string
  walletAddress: string
  githubUsername: string
  githubId: string
  avatarUrl: string | null
  score: number
  lastUpdated: string | null
  createdAt: string
  stats: ContributionStats | null
}

export type ScoreBreakdown = {
  score: number
  lastUpdated: string | null
  breakdown: {
    contributions: {
      commits: number
      pullRequests: number
      issues: number
      stars: number
    }
    normalized: ContributionStats
    rawScore: number
    score: number
  }
}

export type LeaderboardResponse = {
  users: UserProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const TOKEN_KEY = "gitrap.sessionToken"

function readCookie(name: string) {
  if (typeof document === "undefined") return null

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  )
}

function writeCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 7) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export function getSessionToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY) ?? readCookie(TOKEN_KEY)
}

export function setSessionToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
  writeCookie(TOKEN_KEY, token)
}

export function clearSessionToken() {
  window.localStorage.removeItem(TOKEN_KEY)
  deleteCookie(TOKEN_KEY)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const token = getSessionToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  const payload = (await response.json()) as ApiEnvelope<T>

  if (!payload.ok) {
    throw new Error(payload.error.message)
  }

  return payload.data
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
