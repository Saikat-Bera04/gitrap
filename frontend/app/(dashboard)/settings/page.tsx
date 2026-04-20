"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Settings as SettingsIcon, Github, Wallet, RefreshCw, Power, Loader2 } from "lucide-react"
import { apiFetch, shortenAddress, type ScoreBreakdown, type UserProfile } from "@/lib/api"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"

export default function SettingsPage() {
  const router = useRouter()
  const { address, githubHandle, walletError, connectWallet, connectGithub, disconnect } = useWeb3Auth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [score, setScore] = useState<ScoreBreakdown | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async () => {
    const [nextUser, nextScore] = await Promise.all([
      apiFetch<UserProfile>("/api/user/profile"),
      apiFetch<ScoreBreakdown>("/api/user/score"),
    ])
    setUser(nextUser)
    setScore(nextScore)
  }

  useEffect(() => {
    loadProfile().catch((err) => {
      setError(err instanceof Error ? err.message : "Connect wallet and GitHub to activate settings.")
    })
  }, [])

  const handleWalletConnect = async () => {
    setIsConnectingWallet(true)
    try {
      await connectWallet()
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const refreshed = await apiFetch<{ user: UserProfile; score: ScoreBreakdown["breakdown"] }>(
        "/api/user/refresh",
        {
          method: "POST",
          body: JSON.stringify({ force: true }),
        }
      )
      setUser(refreshed.user)
      setScore(await apiFetch<ScoreBreakdown>("/api/user/score"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sync failed")
    } finally {
      setIsRefreshing(false)
    }
  }

  const connectedAddress = address ?? user?.walletAddress ?? null
  const connectedGithub = githubHandle ?? user?.githubUsername ?? null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-10 border-b border-[#a3b1c6]/30 pb-6">
        <SettingsIcon className="w-8 h-8 text-[#2d3436]" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2d3436]">System Config</h1>
          <p className="text-[#4a5568]">Manage your live wallet, GitHub, and reputation sync.</p>
        </div>
      </div>

      {error && (
        <div className="industrial-card p-5 text-sm text-[#ff4757] font-mono">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="industrial-card p-8">
          <h3 className="text-sm font-bold tracking-widest text-[#4a5568] uppercase mb-6 flex items-center gap-2">
            <Power className="w-4 h-4" /> Connections
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#e0e5ec] rounded-xl shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d1d9e6] shadow-[var(--shadow-card)] flex items-center justify-center">
                  <Github className="w-5 h-5 text-[#2d3436]" />
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide">GitHub</div>
                  <div className="text-xs text-[#4a5568] font-mono">{connectedGithub ?? "Not connected"}</div>
                </div>
              </div>

              <button
                onClick={() => void connectGithub().catch((err) => {
                  setError(err instanceof Error ? err.message : "GitHub connection failed")
                })}
                className={`industrial-button px-4 py-2 text-[10px] ${connectedGithub ? "industrial-button-secondary" : "industrial-button-primary"}`}
              >
                {connectedGithub ? "REAUTHORIZE" : "CONNECT"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#e0e5ec] rounded-xl shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d1d9e6] shadow-[var(--shadow-card)] flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#2d3436]" />
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide">MetaMask Wallet</div>
                  <div className="text-xs text-[#4a5568] font-mono">
                    {connectedAddress ? shortenAddress(connectedAddress) : "Not connected"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => void handleWalletConnect().catch((err) => {
                  setError(err instanceof Error ? err.message : "MetaMask connection failed")
                })}
                disabled={isConnectingWallet}
                className="industrial-button industrial-button-secondary px-4 py-2 text-[10px] flex items-center gap-2"
              >
                {isConnectingWallet && <Loader2 className="w-3 h-3 animate-spin" />}
                {connectedAddress ? "CHANGE" : "CONNECT"}
              </button>
            </div>

            {walletError && <div className="text-xs font-mono text-[#ff4757]">{walletError}</div>}
          </div>
        </div>

        <div className="space-y-8">
          <div className="industrial-card p-8">
            <h3 className="text-sm font-bold tracking-widest text-[#4a5568] uppercase mb-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Data Sync
            </h3>
            <p className="text-sm text-[#4a5568] mb-6 leading-relaxed">
              Pull the latest GitHub data, recompute your reputation score, and update the dashboard.
            </p>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing || !connectedGithub}
              className="industrial-button industrial-button-primary w-full flex justify-center items-center gap-2 py-4 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "SYNCING DATA..." : "SYNC GITHUB ACTIVITY"}
            </button>

            <div className="mt-4 text-[10px] font-mono text-center tracking-widest text-[#4a5568] opacity-70">
              LAST SYNC: {user?.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : "NEVER"}
            </div>

            <div className="mt-4 text-center font-mono text-sm text-[#2d3436]">
              SCORE: <span className="font-bold text-[#ff4757]">{score?.score ?? user?.score ?? "--"}</span>
            </div>
          </div>

          <div className="industrial-card p-8 border-2 border-[#ff4757]/30 bg-[#ff4757]/5">
            <h3 className="text-sm font-bold tracking-widest text-[#ff4757] uppercase mb-4">Session</h3>
            <p className="text-xs text-[#4a5568] mb-6 leading-relaxed">
              Disconnecting clears the local gitrap session and detaches the current wallet connection in this browser.
            </p>

            <button
              onClick={() => {
                disconnect()
                router.push("/onboarding")
              }}
              className="industrial-button px-6 py-2 text-xs bg-[#ff4757] text-white shadow-[var(--shadow-glow)] hover:bg-[#ff4757] w-full"
            >
              DISCONNECT SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
