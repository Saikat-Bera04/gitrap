"use client"

import { useEffect, useMemo, useState } from "react"
import { Trophy, Medal, ChevronRight, Search, Loader2 } from "lucide-react"
import { apiFetch, shortenAddress, type LeaderboardResponse, type UserProfile } from "@/lib/api"

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All-time")
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<LeaderboardResponse>("/api/leaderboard?limit=50&page=1")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load leaderboard"))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return users

    return users.filter(
      (user) =>
        user.githubUsername.toLowerCase().includes(value) ||
        user.walletAddress.toLowerCase().includes(value)
    )
  }, [query, users])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="industrial-card p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#ff4757]" /> Global Leaderboard
          </h1>
          <p className="text-[#4a5568] text-sm mt-1">Top verified developers by tracked on-chain activity.</p>
        </div>

        <div className="flex bg-[#d1d9e6]/50 p-1 rounded-xl shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30">
          {["Weekly", "Monthly", "All-time"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${
                filter === f
                  ? "bg-[#e0e5ec] text-[#ff4757] shadow-[var(--shadow-floating)]"
                  : "text-[#4a5568] hover:text-[#2d3436]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by username or address..."
            className="industrial-input w-full pl-12 h-14"
          />
        </div>
      </div>

      <div className="industrial-card overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-4 bg-[#d1d9e6]/30 border-b border-[#a3b1c6]/30 text-xs font-bold tracking-widest text-[#4a5568] uppercase font-mono">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-6 md:col-span-5">Identity</div>
          <div className="col-span-4 md:col-span-3 text-right">Reputation</div>
          <div className="hidden md:block col-span-2 text-right">Repos</div>
          <div className="hidden md:block col-span-1"></div>
        </div>

        <div className="divide-y divide-[#a3b1c6]/20">
          {isLoading && (
            <div className="px-6 py-10 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-[#ff4757]" />
              <span className="font-mono text-sm tracking-widest uppercase text-[#4a5568]">Loading developers</span>
            </div>
          )}

          {error && <div className="px-6 py-10 text-center text-[#4a5568]">{error}</div>}

          {!isLoading && !error && filteredUsers.length === 0 && (
            <div className="px-6 py-10 text-center text-[#4a5568]">No verified developers yet.</div>
          )}

          {filteredUsers.map((user, i) => {
            const rank = i + 1
            const top = rank <= 3

            return (
              <div key={user.id} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-[#fafaf8]/50 transition-colors cursor-pointer group">
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  {top ? (
                    <div className="w-8 h-8 rounded-full bg-[#ff4757]/10 flex items-center justify-center border border-[#ff4757]/30 shadow-[var(--shadow-glow)]">
                      <Medal className={`w-4 h-4 ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : "text-amber-600"}`} />
                    </div>
                  ) : (
                    <span className="font-mono text-[#4a5568] font-bold text-lg">#{rank}</span>
                  )}
                </div>

                <div className="col-span-6 md:col-span-5 flex items-center gap-4 pl-4">
                  <div className="w-10 h-10 rounded-full border-2 border-[#e0e5ec] shadow-[var(--shadow-card)] overflow-hidden shrink-0">
                    <img src={user.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${user.walletAddress}`} alt="avatar" />
                  </div>
                  <div>
                    <div className="font-bold text-[#2d3436] flex items-center gap-2 tracking-tight">
                      {user.githubUsername}
                      {top && <div className="industrial-led-green w-2 h-2" title="Verified Top Tier" />}
                    </div>
                    <div className="text-xs font-mono text-[#4a5568]">{shortenAddress(user.walletAddress)}</div>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-3 text-right">
                  <span className="font-mono text-xl font-bold text-[#2d3436] tracking-tight">{user.score}</span>
                </div>

                <div className="hidden md:block col-span-2 text-right">
                  <span className="font-mono text-sm tracking-widest text-green-600">{user.stats?.repositories ?? 0}</span>
                </div>

                <div className="hidden md:flex col-span-1 justify-end">
                  <div className="w-8 h-8 rounded-full bg-[#d1d9e6]/50 flex items-center justify-center text-[#4a5568] group-hover:bg-[#ff4757] group-hover:text-white group-hover:shadow-[var(--shadow-glow)] transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
