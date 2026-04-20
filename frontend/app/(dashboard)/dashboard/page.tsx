"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Share2, Award, Github, GitPullRequest, Star, CircleDot, Loader2 } from "lucide-react"
import { apiFetch, shortenAddress, type ScoreBreakdown, type UserProfile } from "@/lib/api"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useWeb3Auth()
  const [user, setUser] = useState<UserProfile | null>(profile)
  const [score, setScore] = useState<ScoreBreakdown | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      apiFetch<UserProfile>("/api/user/profile"),
      apiFetch<ScoreBreakdown>("/api/user/score"),
    ])
      .then(([nextUser, nextScore]) => {
        if (cancelled) return
        setUser(nextUser)
        setScore(nextScore)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Unable to load profile")
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = user?.stats
  const bars = useMemo(() => Array.from({ length: 30 }, (_, i) => 24 + ((i * 17) % 68)), [])

  const refresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const refreshed = await apiFetch<{ user: UserProfile; score: ScoreBreakdown["breakdown"]; cached: boolean }>(
        "/api/user/refresh",
        {
          method: "POST",
          body: JSON.stringify({ force: true }),
        }
      )
      setUser(refreshed.user)
      setScore(await apiFetch<ScoreBreakdown>("/api/user/score"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh GitHub data")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user && !error) {
    return (
      <div className="industrial-card p-10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#ff4757]" />
        <span className="font-mono text-sm tracking-widest uppercase text-[#4a5568]">Loading reputation</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="industrial-card p-10 text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-3">Connect your identity</h1>
        <p className="text-[#4a5568] mb-8">{error}</p>
        <button onClick={() => router.push("/onboarding")} className="industrial-button industrial-button-primary h-12 px-8">
          Start Onboarding
        </button>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="industrial-card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full border-4 border-[#e0e5ec] shadow-[var(--shadow-floating)] overflow-hidden shrink-0 relative">
          <img src={user.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.walletAddress}`} alt="Avatar" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#a3b1c6]/30 pb-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">{user.githubUsername}</h1>
              <div className="font-mono text-sm tracking-wide text-[#4a5568]">{shortenAddress(user.walletAddress)}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={refresh} disabled={isRefreshing} className="industrial-button industrial-button-secondary text-[11px] p-3 flex items-center justify-center">
                {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} REFRESH
              </button>
              <button className="industrial-button industrial-button-primary text-[11px] p-3 flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" /> SHARE
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className="font-mono text-xs tracking-widest text-[#4a5568] uppercase">ON-CHAIN REPUTATION</span>
            <div className="font-mono text-4xl font-bold text-[#ff4757] drop-shadow-md">{user.score}</div>
            <div className="px-3 py-1 bg-[#d1d9e6] rounded text-[10px] font-bold tracking-widest uppercase shadow-[var(--shadow-recessed)]">
              VERIFIED
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Commits", value: stats?.commits ?? 0, icon: Github },
          { label: "Merged PRs", value: stats?.pullRequests ?? 0, icon: GitPullRequest },
          { label: "Issues", value: stats?.issues ?? 0, icon: CircleDot },
          { label: "Stars Earned", value: stats?.stars ?? 0, icon: Star },
        ].map((stat, i) => (
          <div key={i} className="industrial-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full mb-4 bg-[#e0e5ec] shadow-[var(--shadow-recessed)] flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-[#ff4757]" />
            </div>
            <div className="font-mono text-2xl font-bold mb-1">{stat.value.toLocaleString()}</div>
            <div className="text-xs font-bold tracking-widest text-[#4a5568] uppercase font-mono">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 industrial-card p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Activity Timeline</h3>
            <div className="px-3 py-1 bg-[#d1d9e6] rounded text-[10px] font-mono tracking-widest shadow-[var(--shadow-recessed)]">
              VERIFIED SNAPSHOT
            </div>
          </div>

          <div className="flex-1 bg-[#d1d9e6]/30 rounded-xl shadow-[var(--shadow-recessed)] flex items-end p-4 gap-2 h-64 border border-[#a3b1c6]/20">
            {bars.map((height, i) => (
              <div key={i} className="flex-1 bg-[#e0e5ec] shadow-[var(--shadow-floating)] rounded-t-sm" style={{ height: `${height}%` }}>
                <div className={`w-full h-full rounded-t-sm transition-opacity duration-300 ${i % 5 === 0 ? "bg-[#ff4757]/80" : "bg-[#a3b1c6]/20"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="industrial-card p-8 flex flex-col">
          <h3 className="font-bold text-lg mb-6 drop-shadow-sm">Scoring Breakdown</h3>

          <div className="space-y-6 flex-1">
            {[
              { label: "Commits", pts: score?.breakdown.contributions.commits ?? 0 },
              { label: "Merged PRs", pts: score?.breakdown.contributions.pullRequests ?? 0 },
              { label: "Issues", pts: score?.breakdown.contributions.issues ?? 0 },
              { label: "Stars", pts: score?.breakdown.contributions.stars ?? 0 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between font-mono text-sm mb-2">
                  <span className="text-[#4a5568]">{item.label}</span>
                  <span className="font-bold text-[#2d3436]">+{Math.round(item.pts)}</span>
                </div>
                <div className="h-2 rounded-full shadow-[var(--shadow-recessed)] bg-[#d1d9e6] overflow-hidden">
                  <div className="h-full bg-[#ff4757]" style={{ width: `${Math.min(100, (item.pts / Math.max(user.score, 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#a3b1c6]/30 text-center">
            <button onClick={() => router.push("/mint")} className="industrial-button industrial-button-primary w-full shadow-lg gap-2 text-xs flex justify-center items-center">
              <Award className="w-4 h-4" /> MINT LATEST SBT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
