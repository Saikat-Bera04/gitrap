"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Filter, ShieldCheck, Star, Zap, Github, ChevronDown, ExternalLink, BriefcaseBusiness, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { apiFetch, shortenAddress, type DaoVoteSummary, type LeaderboardResponse, type UserProfile } from "@/lib/api"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"

const DEMO_DAOS = [
  {
    name: "Gitcoin Grants",
    focus: "Public goods funding",
    bounty: "$3k - $12k",
    stack: ["TypeScript", "Solidity", "Data"],
    pitch: "Match verified contributors to grant tooling, impact analytics, and payout automation work.",
    url: "https://www.gitcoin.co/"
  },
  {
    name: "Arbitrum DAO",
    focus: "L2 governance and protocol ops",
    bounty: "$5k - $25k",
    stack: ["Solidity", "Governance", "Security"],
    pitch: "Use GitRap scores to shortlist auditors and protocol engineers for governance-funded initiatives.",
    url: "https://arbitrum.foundation/"
  },
  {
    name: "Optimism Collective",
    focus: "Retro funding and ecosystem apps",
    bounty: "$4k - $20k",
    stack: ["React", "Node", "Ethereum"],
    pitch: "Route verified builders into RetroPGF tooling, dashboards, and open-source maintenance tasks.",
    url: "https://www.optimism.io/"
  },
  {
    name: "ENS DAO",
    focus: "Identity infrastructure",
    bounty: "$2k - $15k",
    stack: ["Frontend", "Subgraphs", "Solidity"],
    pitch: "Find reputation-backed developers for identity UX, resolver tooling, and protocol integrations.",
    url: "https://ens.domains/"
  }
]

function inferSkills(user: UserProfile) {
  const stats = user.stats
  const skills = ["GitHub"]
  if ((stats?.pullRequests ?? 0) > 10) skills.push("Open Source")
  if ((stats?.stars ?? 0) > 50) skills.push("Maintainer")
  if ((stats?.issues ?? 0) > 20) skills.push("Triage")
  if (user.score > 1000) skills.push("Web3 Ready")
  return skills.slice(0, 3)
}

export default function DaoDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [votes, setVotes] = useState<DaoVoteSummary>({})
  const [votingDao, setVotingDao] = useState<string | null>(null)
  const [votingVerdict, setVotingVerdict] = useState<"verified" | "not_verified" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { address, connectWallet } = useWeb3Auth()

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        setIsLoading(true)
        
        console.log("[DAO] Loading leaderboard and votes data...")
        
        const [leaderboard, voteSummary] = await Promise.all([
          apiFetch<LeaderboardResponse>("/api/leaderboard?limit=24&page=1").catch(err => {
            console.error("[DAO] Leaderboard fetch failed:", err)
            throw err
          }),
          apiFetch<DaoVoteSummary>("/api/dao/votes").catch(err => {
            console.error("[DAO] Votes fetch failed:", err)
            throw err
          })
        ])
        
        console.log("[DAO] Data loaded successfully", { users: leaderboard.users.length, votes: Object.keys(voteSummary).length })
        setUsers(leaderboard.users)
        setVotes(voteSummary)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load verified contributors"
        console.error("[DAO] Error:", message)
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    
    void loadData()
  }, [])

  const voteDao = async (daoName: string, verdict: "verified" | "not_verified") => {
    setVotingDao(daoName)
    setVotingVerdict(verdict)
    setError(null)
    try {
      const walletAddress = address ?? (await connectWallet())
      
      console.log("[DAO] Voting:", { daoName, verdict, walletAddress })
      
      await apiFetch("/api/dao/votes", {
        method: "POST",
        body: JSON.stringify({ daoName, verdict, walletAddress })
      })
      
      console.log("[DAO] Vote recorded successfully, refreshing votes...")
      
      const updatedVotes = await apiFetch<DaoVoteSummary>("/api/dao/votes")
      setVotes(updatedVotes)
      
      console.log("[DAO] Votes refreshed successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "DAO vote failed"
      console.error("[DAO] Vote error:", message)
      setError(message)
    } finally {
      setVotingDao(null)
      setVotingVerdict(null)
    }
  }

  const filteredUsers = useMemo(() => {
    const value = searchTerm.trim().toLowerCase()
    if (!value) return users
    return users.filter(
      (user) =>
        user.githubUsername.toLowerCase().includes(value) ||
        user.walletAddress.toLowerCase().includes(value) ||
        inferSkills(user).some((skill) => skill.toLowerCase().includes(value))
    )
  }, [searchTerm, users])

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-[#2d3436]">
            <ShieldCheck className="w-8 h-8 text-[#ff4757]" /> Talent Discovery
          </h1>
          <p className="text-[#4a5568] max-w-xl leading-relaxed">
            Discover verified developers from live GitRap scores, then pitch them into DAO workstreams.
          </p>
        </div>
      </div>

      <div className="industrial-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BriefcaseBusiness className="w-5 h-5 text-[#ff4757]" />
          <h2 className="font-bold tracking-tight text-xl">DAO Pitch Board</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {DEMO_DAOS.map((dao) => (
            <div key={dao.name} className="bg-[#e0e5ec] rounded-lg p-5 border border-[#a3b1c6]/30 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-[#2d3436]">{dao.name}</h3>
                  <p className="text-xs font-mono text-[#4a5568]">{dao.focus}</p>
                </div>
                <a href={dao.url} target="_blank" className="w-8 h-8 rounded bg-[#d1d9e6]/60 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-[#4a5568]" />
                </a>
              </div>
              <div className="font-mono text-sm font-bold text-[#ff4757] mb-3">{dao.bounty}</div>
              <p className="text-xs text-[#4a5568] leading-relaxed mb-4">{dao.pitch}</p>
              <div className="flex flex-wrap gap-2">
                {dao.stack.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-[#d1d9e6]/60 rounded text-[10px] font-mono">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  onClick={() => void voteDao(dao.name, "verified")}
                  disabled={votingDao === dao.name}
                  className="industrial-button industrial-button-secondary h-9 text-[10px] flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {votingDao === dao.name && votingVerdict === "verified" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-3 h-3" />
                  )}
                  VERIFIED {votes[dao.name]?.verified ?? 0}
                </button>
                <button
                  onClick={() => void voteDao(dao.name, "not_verified")}
                  disabled={votingDao === dao.name}
                  className="industrial-button h-9 text-[10px] flex items-center justify-center gap-1 bg-[#ff4757] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {votingDao === dao.name && votingVerdict === "not_verified" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-3 h-3" />
                  )}
                  NOT {votes[dao.name]?.notVerified ?? 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="industrial-card p-4 flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
          <input
            type="text"
            placeholder="Search verified developers, skills, or wallet..."
            className="industrial-input w-full pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button className="h-12 px-6 bg-[#d1d9e6]/50 border border-[#a3b1c6]/40 rounded-lg flex items-center gap-3 font-bold text-sm tracking-widest text-[#2d3436] hover:bg-[#e0e5ec] transition-colors">
            <Filter className="w-4 h-4" /> LIVE DATA <ChevronDown className="w-4 h-4 text-[#4a5568]" />
          </button>

          <button className="h-12 px-6 bg-[#d1d9e6]/50 border border-[#a3b1c6]/40 rounded-lg flex items-center gap-3 font-bold text-sm tracking-widest text-[#2d3436] hover:bg-[#e0e5ec] transition-colors">
            <Star className="w-4 h-4" /> SCORE SORT <ChevronDown className="w-4 h-4 text-[#4a5568]" />
          </button>
        </div>
      </div>

      {error && (
        <div className="industrial-card p-5 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 font-mono text-sm">
            <div className="font-bold mb-2">⚠️ Error loading DAO data:</div>
            <div className="text-xs text-red-600 mb-3">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs underline hover:no-underline text-red-600"
            >
              Refresh page
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="industrial-card p-10 text-center text-[#4a5568]">
          <Loader2 className="w-6 h-6 animate-spin inline-block mb-3" />
          <p className="font-mono text-sm">Loading verified contributors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((dev) => {
            const skills = inferSkills(dev)
            return (
              <div key={dev.id} className="industrial-card flex flex-col pt-6 pb-0 overflow-hidden group">
                <div className="px-6 flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-full border-2 border-[#e0e5ec] shadow-[var(--shadow-card)] overflow-hidden shrink-0">
                    <img src={dev.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${dev.walletAddress}`} alt="avatar" />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase shadow-[var(--shadow-recessed)] bg-green-100 text-green-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      VERIFIED
                    </div>
                  </div>
                </div>

                <div className="px-6 mb-4">
                  <h3 className="font-bold text-lg tracking-tight mb-1">{dev.githubUsername}</h3>
                  <p className="text-xs font-mono text-[#4a5568]">{shortenAddress(dev.walletAddress)}</p>
                </div>

                <div className="px-6 flex flex-wrap gap-2 mb-6">
                  {skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-[#d1d9e6]/50 border border-[#a3b1c6]/30 text-[#2d3436] rounded text-[10px] font-mono tracking-widest shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto grid grid-cols-2 border-t border-[#a3b1c6]/30 bg-[#d1d9e6]/20 py-3">
                  <div className="flex flex-col items-center border-r border-[#a3b1c6]/30">
                    <div className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-0.5 flex items-center justify-center gap-1"><Zap className="w-3 h-3"/> REP SCORE</div>
                    <div className="font-mono font-bold text-[#ff4757]">{dev.score}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-0.5 flex items-center justify-center gap-1"><Github className="w-3 h-3"/> REPOS</div>
                    <div className="font-mono font-bold text-[#2d3436]">{dev.stats?.repositories ?? 0}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!error && !isLoading && filteredUsers.length === 0 && (
        <div className="industrial-card p-10 text-center text-[#4a5568]">
          No live contributors yet. Connect GitHub from onboarding to seed the discovery board.
        </div>
      )}
    </div>
  )
}
