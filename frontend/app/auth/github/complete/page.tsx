"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { setSessionToken } from "@/lib/api"

function readCookie(name: string) {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  )
}

function CompleteContent() {
  const router = useRouter()
  const params = useSearchParams()
  const error = params.get("error")

  useEffect(() => {
    if (error) return

    const token = readCookie("gitrap.sessionToken")
    if (token) {
      setSessionToken(decodeURIComponent(token))
    }

    window.localStorage.removeItem("gitrap.oauthState")
    window.localStorage.removeItem("gitrap.pendingWallet")
    router.replace("/dashboard")
  }, [error, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#e0e5ec]">
      <div className="industrial-card p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[var(--shadow-recessed)] flex items-center justify-center mx-auto mb-6">
          {error ? <CheckCircle2 className="w-8 h-8 text-[#ff4757]" /> : <Loader2 className="w-8 h-8 text-[#ff4757] animate-spin" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">{error ? "Connection Failed" : "Identity Verified"}</h1>
        <p className="text-[#4a5568] leading-relaxed">
          {error ?? "Opening your dashboard with your verified reputation score."}
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

export default function GitHubCompletePage() {
  return (
    <Suspense fallback={null}>
      <CompleteContent />
    </Suspense>
  )
}
