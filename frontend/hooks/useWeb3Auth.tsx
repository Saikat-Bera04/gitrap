"use client"

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { apiFetch, clearSessionToken, getSessionToken, type UserProfile } from "@/lib/api"

type Web3AuthContextType = {
  address: string | null
  githubHandle: string | null
  profile: UserProfile | null
  isConnectingWallet: boolean
  isConnectingGithub: boolean
  connectWallet: () => Promise<void>
  connectGithub: () => Promise<void>
  disconnect: () => void
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect: disconnectWallet } = useDisconnect()

  useEffect(() => {
    if (!getSessionToken()) return

    let cancelled = false
    apiFetch<UserProfile>("/api/user/profile")
      .then((nextProfile) => {
        if (!cancelled) setProfile(nextProfile)
      })
      .catch(() => {
        clearSessionToken()
        if (!cancelled) setProfile(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const connectWallet = async () => {
    setIsConnectingWallet(true)
    try {
      const ethereum = (window as typeof window & { ethereum?: { isMetaMask?: boolean } }).ethereum

      if (!ethereum?.isMetaMask) {
        throw new Error("MetaMask was not detected. Install or enable MetaMask, then try again.")
      }

      const injected =
        connectors.find((connector) => connector.name.toLowerCase().includes("metamask")) ??
        connectors.find((connector) => connector.id === "injected")

      if (!injected) {
        throw new Error("MetaMask connector was not found")
      }

      await connectAsync({ connector: injected })
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const connectGithub = async () => {
    if (!address) {
      await connectWallet()
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI

    if (!clientId || !redirectUri) {
      throw new Error("GitHub OAuth environment variables are missing")
    }

    setIsConnectingGithub(true)
    const nonce = crypto.randomUUID()
    const state = btoa(JSON.stringify({ nonce, walletAddress: address }))
    window.localStorage.setItem("gitrap.oauthState", nonce)
    window.localStorage.setItem("gitrap.pendingWallet", address)
    document.cookie = `gitrap.oauthState=${nonce}; path=/; max-age=600; SameSite=Lax`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user repo",
      state,
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  const disconnect = () => {
    clearSessionToken()
    window.localStorage.removeItem("gitrap.oauthState")
    window.localStorage.removeItem("gitrap.pendingWallet")
    setProfile(null)
    disconnectWallet()
    router.push("/onboarding")
  }

  const value = useMemo<Web3AuthContextType>(
    () => ({
      address: address ?? profile?.walletAddress ?? null,
      githubHandle: profile?.githubUsername ?? null,
      profile,
      isConnectingWallet: isConnectingWallet || (!isConnected && false),
      isConnectingGithub,
      connectWallet,
      connectGithub,
      disconnect,
    }),
    [address, profile, isConnectingWallet, isConnected, isConnectingGithub]
  )

  return <Web3AuthContext.Provider value={value}>{children}</Web3AuthContext.Provider>
}

export function useWeb3Auth() {
  const ctx = useContext(Web3AuthContext)
  if (!ctx) throw new Error("useWeb3Auth must be used within Web3AuthProvider")
  return ctx
}
