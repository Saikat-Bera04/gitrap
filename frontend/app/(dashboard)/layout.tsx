"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { Activity, LayoutDashboard, Settings, Award, Users, Shield, Zap } from "lucide-react"
import { shortenAddress } from "@/lib/api"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { address, profile } = useWeb3Auth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayAddress = mounted ? address ?? profile?.walletAddress : null
  const avatarSeed = displayAddress ?? "gitrap"

  return (
    <div className="flex h-screen bg-[#e0e5ec] overflow-hidden">
      <aside className="w-64 flex-shrink-0 relative z-20 flex flex-col border-r border-[#a3b1c6]/30 shadow-[var(--shadow-card)]">
        <div className="h-20 flex items-center px-8 flex-shrink-0">
          <span className="font-pixel text-[11px] tracking-[0.25em] font-bold text-[#2d3436]">GITRAP_OS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {[
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Public Profile", href: `/profile/${profile?.githubUsername ?? "me"}`, icon: Shield },
            { label: "Mint NFT", href: "/mint", icon: Award },
            { label: "Leaderboard", href: "/leaderboard", icon: Activity },
            { label: "Issues", href: "/issues", icon: Activity },
            { label: "DAO Network", href: "/dao", icon: Users },
            { label: "Governance", href: "/governance", icon: Activity },
            { label: "Settings", href: "/settings", icon: Settings },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium tracking-wide text-[#4a5568] hover:text-[#2d3436] hover:bg-[#d1d9e6]/50 hover:shadow-[var(--shadow-recessed)] transition-all group"
            >
              <item.icon className="w-5 h-5 text-[#ff4757]/80 group-hover:text-[#ff4757] transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-[#a3b1c6]/30">
          <div className="flex items-center gap-3">
            <div className="industrial-led-green" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#4a5568]">SYSTEM OPERATIONAL</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-[#a3b1c6]/30">
          <div className="flex items-center gap-4 text-[#4a5568]">
            <span className="font-mono text-xs tracking-widest uppercase opacity-60">Connected Node: Sepolia</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff4757]" />
              <span className="font-mono text-sm tracking-wide font-bold">{profile ? `SCORE ${profile.score}` : "LIVE"}</span>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-[#a3b1c6]/40 text-[#2d3436]">
              <span className="font-sans font-semibold text-sm">
                {displayAddress ? shortenAddress(displayAddress) : "CONNECT WALLET"}
              </span>
              <div className="w-10 h-10 rounded-full border-2 border-[#e0e5ec] shadow-[var(--shadow-card)] overflow-hidden">
                <img src={profile?.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
