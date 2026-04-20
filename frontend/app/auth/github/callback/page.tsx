"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Github, Loader2 } from "lucide-react"
import { setSessionToken, type ScoreBreakdown, type UserProfile } from "@/lib/api"

type AuthResponse = {
  token: string
  user: UserProfile
  score: ScoreBreakdown["breakdown"]
  warnings: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function GitHubCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [message, setMessage] = useState("Authorizing GitHub")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get("code")
    const state = params.get("state")
    const savedState = window.localStorage.getItem("gitrap.oauthState")
    const walletAddress = window.localStorage.getItem("gitrap.pendingWallet")

    if (!code || !state || state !== savedState || !walletAddress) {
      setError("GitHub authorization could not be verified. Please try connecting again.")
      return
    }

    setMessage("Fetching GitHub contributions")

    fetch(`${API_URL}/api/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, walletAddress }),
    })
      .then(async (response) => {
        const payload = await response.json()
        if (!payload.ok) {
          throw new Error(payload.error?.message ?? "GitHub authorization failed")
        }
        return payload.data as AuthResponse
      })
      .then((data) => {
        setSessionToken(data.token)
        window.localStorage.removeItem("gitrap.oauthState")
        window.localStorage.removeItem("gitrap.pendingWallet")
        setMessage("Reputation score ready")
        router.replace("/dashboard")
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "GitHub authorization failed")
      })
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#e0e5ec]">
      <div className="industrial-card p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[var(--shadow-recessed)] flex items-center justify-center mx-auto mb-6">
          {error ? <Github className="w-8 h-8 text-[#ff4757]" /> : <Loader2 className="w-8 h-8 text-[#ff4757] animate-spin" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">{error ? "Connection Failed" : message}</h1>
        <p className="text-[#4a5568] leading-relaxed">
          {error ?? "Keep this tab open while gitrap verifies your developer profile."}
        </p>
        {error && (
          <button
            onClick={() => router.replace("/onboarding")}
            className="industrial-button industrial-button-primary w-full h-12 mt-8"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#e0e5ec]">
          <div className="industrial-card p-10 w-full max-w-md text-center">
            <Loader2 className="w-8 h-8 text-[#ff4757] animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <GitHubCallbackContent />
    </Suspense>
  )
}
