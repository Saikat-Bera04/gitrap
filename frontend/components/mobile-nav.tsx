"use client"

import { useEffect, useState } from "react"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"
import { useRouter } from "next/navigation"
import { Wallet, LayoutDashboard } from "lucide-react"

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "DAO Cards", href: "/dao" },
]

const NAV_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { address, disconnect } = useWeb3Auth()
  const router = useRouter()

  const close = () => setOpen(false)
  const hasAddress = mounted && Boolean(address)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">

        {/* Main bar */}
        <nav
          className="flex items-center justify-between px-5 py-3 rounded-2xl border border-black/[0.06]"
          style={NAV_STYLE}
        >
          <span className="font-pixel text-xs tracking-[0.25em] text-black/70">GITRAP</span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] text-black/60 hover:text-black transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {hasAddress ? (
              <button 
                onClick={() => router.push("/dashboard")}
                className="text-[11px] px-4 py-2 rounded-xl bg-[#e0e5ec] border border-black/10 text-[#2d3436] hover:bg-black/[0.03] hover:border-black/20 shadow-[var(--shadow-card)] font-bold transition-all duration-200 tracking-wide hidden md:flex items-center gap-2" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                <LayoutDashboard className="w-4 h-4" /> DASHBOARD
              </button>
            ) : (
              <button 
                onClick={() => router.push("/onboarding")}
                className="text-[11px] px-4 py-2 rounded-xl bg-[#2d3436] border border-[#2d3436] text-[#e0e5ec] hover:bg-black hover:border-black shadow-[var(--shadow-card)] font-bold transition-all duration-200 tracking-wide hidden md:block" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                CONNECT WALLET
              </button>
            )}

            {/* Burger — mobile only */}
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg hover:bg-black/[0.04] transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span
                className="block h-px bg-black/60 transition-all duration-300 origin-center"
                style={{
                  width: "18px",
                  transform: open ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-px bg-black/60 transition-all duration-300"
                style={{
                  width: "18px",
                  opacity: open ? 0 : 1,
                  transform: open ? "scaleX(0)" : "none",
                }}
              />
              <span
                className="block h-px bg-black/60 transition-all duration-300 origin-center"
                style={{
                  width: "18px",
                  transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className="md:hidden mt-2 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? "320px" : "0px", opacity: open ? 1 : 0 }}
        >
          <div
            className="rounded-2xl border border-black/[0.06] px-2 py-2 flex flex-col"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="px-4 py-3 text-sm text-black/60 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors tracking-wide"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1">
              {hasAddress ? (
                <button 
                  onClick={() => { close(); router.push("/dashboard"); }}
                  className="w-full text-[11px] px-4 py-2.5 rounded-xl bg-[#e0e5ec] border border-black/10 text-[#2d3436] hover:bg-black/[0.03] hover:border-black/20 shadow-[var(--shadow-card)] font-bold transition-all duration-200 tracking-wide flex justify-center items-center gap-2" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  <LayoutDashboard className="w-4 h-4" /> DASHBOARD
                </button>
              ) : (
                <button 
                  onClick={() => { close(); router.push("/onboarding"); }}
                  className="w-full text-[11px] px-4 py-2.5 rounded-xl bg-[#2d3436] border border-[#2d3436] text-[#e0e5ec] hover:bg-black hover:border-black shadow-[var(--shadow-card)] font-bold transition-all duration-200 tracking-wide" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                  CONNECT WALLET
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
