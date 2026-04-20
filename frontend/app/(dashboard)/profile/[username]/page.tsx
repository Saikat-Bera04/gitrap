"use client"

import { use, useEffect, useMemo, useState } from "react"
import { Share2, Github, Wallet, BadgeCheck, Hexagon, Calendar, GitCommit, Loader2 } from "lucide-react"
import { apiFetch, shortenAddress, type UserProfile } from "@/lib/api"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"

function makeActivityCells(seed: string) {
  let value = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0)
  return Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => {
      value = (value * 9301 + 49297) % 233280
      return value / 233280
    })
  )
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { profile } = useWeb3Auth()
  const [user, setUser] = useState<UserProfile | null>(username === "me" ? profile : null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const target = username === "me" ? profile?.githubUsername : username

    if (!target) {
      setError("Connect GitHub to view your public profile.")
      return
    }

    apiFetch<UserProfile>(`/api/user/public/${target}`)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : "Profile not found"))
  }, [profile?.githubUsername, username])

  const activity = useMemo(() => makeActivityCells(user?.githubUsername ?? username), [user?.githubUsername, username])

  if (!user && !error) {
    return (
      <div className="industrial-card p-10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#ff4757]" />
        <span className="font-mono text-sm tracking-widest uppercase text-[#4a5568]">Loading public profile</span>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="industrial-card p-10 max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-3">Profile unavailable</h1>
        <p className="text-[#4a5568]">{error}</p>
      </div>
    )
  }

  const stats = user.stats
  const timeline = [
    { title: `Verified ${stats?.commits ?? 0} quality commits`, date: user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "recently" },
    { title: `Merged ${stats?.pullRequests ?? 0} pull requests`, date: "GitHub verified" },
    { title: `Resolved or created ${stats?.issues ?? 0} issues`, date: "GitHub verified" },
    { title: `Earned ${stats?.stars ?? 0} repository stars`, date: "GitHub verified" }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="relative">
        <div className="h-48 w-full rounded-2xl bg-[#2d3436] overflow-hidden relative shadow-[var(--shadow-card)]">
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.2 }} />
        </div>

        <div className="px-8 flex flex-col md:flex-row gap-8 items-start relative -mt-20">
          <div className="w-40 h-40 rounded-full border-8 border-[#e0e5ec] shadow-[var(--shadow-floating)] bg-[#e0e5ec] overflow-hidden z-10">
            <img src={user.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.walletAddress}`} alt={user.githubUsername} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 pt-24 md:pt-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#2d3436] flex items-center gap-3">
                {user.githubUsername}
                <BadgeCheck className="w-8 h-8 text-[#ff4757]" />
              </h1>

              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d1d9e6]/50 shadow-[var(--shadow-recessed)] rounded-md border border-[#a3b1c6]/30">
                  <Github className="w-4 h-4 text-[#2d3436]" />
                  <span className="text-xs font-mono tracking-widest text-[#4a5568]">GITHUB VERIFIED</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d1d9e6]/50 shadow-[var(--shadow-recessed)] rounded-md border border-[#a3b1c6]/30">
                  <Wallet className="w-4 h-4 text-[#2d3436]" />
                  <span className="text-xs font-mono tracking-widest text-[#4a5568]">{shortenAddress(user.walletAddress)}</span>
                </div>
              </div>
            </div>

            <button className="industrial-button industrial-button-secondary text-xs px-6 flex justify-center items-center gap-2">
              <Share2 className="w-4 h-4" /> SHARE PROFILE
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="industrial-card p-8 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-2 uppercase">Verified Reputation</div>
            <div className="font-mono text-6xl font-bold text-[#ff4757] drop-shadow-md tracking-tighter mb-4">{user.score}</div>

            <div className="w-full bg-[#d1d9e6] rounded-full h-2 mb-2 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.15)] overflow-hidden">
              <div className="bg-[#ff4757] h-full rounded-full" style={{ width: `${Math.min(100, Math.max(8, user.score / 50))}%` }} />
            </div>
            <div className="text-[10px] font-mono tracking-widest text-[#4a5568] w-full text-right">LIVE SCORE</div>
          </div>

          <div className="industrial-card p-6">
            <h3 className="font-bold tracking-tight mb-4 flex items-center gap-2">
              <Hexagon className="w-5 h-5 text-[#ff4757]" /> Badges & SBTs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {["Verified", "Builder", "Maintainer", "DAO Ready"].map((badge) => (
                <div key={badge} className="aspect-square rounded-xl bg-[#d1d9e6]/30 shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30 flex flex-col items-center justify-center p-2 group">
                  <Hexagon className="w-8 h-8 text-[#2d3436] opacity-50 group-hover:opacity-100 group-hover:text-[#ff4757] transition-all" />
                  <span className="text-[9px] font-mono mt-2 tracking-widest text-center text-[#4a5568]">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="industrial-card p-6 space-y-4 font-mono text-sm">
            <div className="flex justify-between border-b border-[#a3b1c6]/30 pb-2">
              <span className="text-[#4a5568]">Total Commits</span>
              <span className="font-bold text-[#2d3436]">{stats?.commits ?? 0}</span>
            </div>
            <div className="flex justify-between border-b border-[#a3b1c6]/30 pb-2">
              <span className="text-[#4a5568]">Pull Requests</span>
              <span className="font-bold text-[#2d3436]">{stats?.pullRequests ?? 0}</span>
            </div>
            <div className="flex justify-between border-b border-[#a3b1c6]/30 pb-2">
              <span className="text-[#4a5568]">Repositories</span>
              <span className="font-bold text-[#2d3436]">{stats?.repositories ?? 0}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-[#4a5568]">Joined</span>
              <span className="font-bold text-[#2d3436]">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="industrial-card p-8">
            <h3 className="font-bold tracking-tight mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ff4757]" /> Contribution Activity
            </h3>

            <div className="flex gap-1 overflow-x-auto pb-2">
              {activity.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
                  {week.map((intensity, day) => {
                    const color = intensity > 0.8 ? "bg-[#ff4757]" : intensity > 0.5 ? "bg-[#ff4757]/60" : intensity > 0.2 ? "bg-[#ff4757]/30" : "bg-[#d1d9e6] shadow-[var(--shadow-recessed)]"
                    return <div key={day} className={`w-3 h-3 rounded-sm ${color} transition-colors hover:border hover:border-black`} />
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="industrial-card p-8">
            <h3 className="font-bold tracking-tight mb-8">Recent Verifiable Actions</h3>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#a3b1c6] before:to-transparent">
              {timeline.map((event, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#e0e5ec] bg-[#ff4757] text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[var(--shadow-glow)] ml-0 md:ml-auto md:mr-auto z-10 transition-transform hover:scale-125 hover:rotate-12">
                    <GitCommit className="w-4 h-4" />
                  </div>

                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 bg-[#e0e5ec] shadow-[var(--shadow-card)] rounded-xl border border-[#a3b1c6]/30 group-hover:-translate-y-1 transition-transform">
                    <h4 className="font-bold text-sm text-[#2d3436] tracking-tight mb-1">{event.title}</h4>
                    <div className="text-[10px] font-mono text-[#4a5568] tracking-widest">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
