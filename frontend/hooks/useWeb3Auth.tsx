"use client"

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { sepolia } from "wagmi/chains"
import { apiFetch, clearSessionToken, getSessionToken, type UserProfile } from "@/lib/api"

type EthereumProvider = {
  isMetaMask?: boolean
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
}

type Web3AuthContextType = {
  address: string | null
  githubHandle: string | null
  profile: UserProfile | null
  isConnectingWallet: boolean
  isConnectingGithub: boolean
  walletError: string | null
  connectWallet: () => Promise<string>
  connectGithub: () => Promise<void>
  disconnect: () => void
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnect: disconnectWallet } = useDisconnect()

  useEffect(() => {
    if (!getSessionToken()) {
      console.log("[Web3Auth] No session token found")
      return
    }

    console.log("[Web3Auth] Loading user profile...")
    let cancelled = false
    apiFetch<UserProfile>("/api/user/profile")
      .then((nextProfile) => {
        if (!cancelled) {
          console.log("[Web3Auth] Profile loaded:", nextProfile.githubUsername)
          setProfile(nextProfile)
        }
      })
      .catch((err) => {
        console.error("[Web3Auth] Failed to load profile:", err)
        clearSessionToken()
        if (!cancelled) setProfile(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (address) {
      setWalletAddress(address)
    }
  }, [address])

  useEffect(() => {
    const ethereum = (window as typeof window & { ethereum?: EthereumProvider }).ethereum
    
    // Only set up listener if ethereum exists and has the on method
    if (!ethereum || typeof ethereum.on !== "function") {
      return
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined
      setWalletAddress(accounts?.[0] ?? null)
    }

    try {
      ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        if (typeof ethereum.removeListener === "function") {
          ethereum.removeListener("accountsChanged", handleAccountsChanged)
        }
      }
    } catch (err) {
      console.error("[Web3Auth] Failed to set up account change listener:", err)
    }
  }, [])

  const switchToSepolia = async (ethereum: EthereumProvider) => {
    try {
      console.log("[Web3Auth] Attempting to switch to Sepolia...")
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${sepolia.id.toString(16)}` }],
      })
      console.log("[Web3Auth] Successfully switched to Sepolia")
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err ? (err as { code?: number }).code : undefined

      if (code !== 4902) {
        console.error("[Web3Auth] Failed to switch chain:", err)
        throw err
      }

      console.log("[Web3Auth] Adding Sepolia network to MetaMask...")
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${sepolia.id.toString(16)}`,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL ?? "https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      })
      console.log("[Web3Auth] Successfully added Sepolia network")
    }
  }

  const connectWallet = async () => {
    setIsConnectingWallet(true)
    setWalletError(null)
    try {
      const ethereum = (window as typeof window & { ethereum?: EthereumProvider }).ethereum

      if (!ethereum?.isMetaMask) {
        throw new Error("MetaMask was not detected. Install or enable MetaMask, then try again.")
      }

      const injected =
        connectors.find((connector) => connector.name.toLowerCase().includes("metamask")) ??
        connectors[0]

      if (!injected) {
        throw new Error("MetaMask connector was not found")
      }

      console.log("[Web3Auth] Requesting accounts from MetaMask...")
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[]
      const nextAddress = accounts[0]

      if (!nextAddress) {
        throw new Error("MetaMask did not return an account")
      }

      console.log("[Web3Auth] Switching to Sepolia network...")
      await switchToSepolia(ethereum)
      
      console.log("[Web3Auth] Connecting via Wagmi...")
      await connectAsync({ connector: injected, chainId: sepolia.id })
      setWalletAddress(nextAddress)
      
      console.log("[Web3Auth] Wallet connected successfully:", nextAddress)
      return nextAddress
    } catch (err) {
      const message = err instanceof Error ? err.message : "MetaMask connection failed"
      console.error("[Web3Auth] Wallet connection error:", message)
      setWalletError(message)
      throw err
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const connectGithub = async () => {
    console.log("[Web3Auth] Starting GitHub OAuth flow...")
    const activeAddress = walletAddress ?? address ?? (await connectWallet())
    console.log("[Web3Auth] Active address:", activeAddress)

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI

    if (!clientId || !redirectUri) {
      console.error("[Web3Auth] Missing GitHub OAuth environment variables")
      throw new Error("GitHub OAuth environment variables are missing")
    }

    setIsConnectingGithub(true)
    const nonce = crypto.randomUUID()
    const state = btoa(JSON.stringify({ nonce, walletAddress: activeAddress }))
    window.localStorage.setItem("gitrap.oauthState", nonce)
    window.localStorage.setItem("gitrap.pendingWallet", activeAddress)
    document.cookie = `gitrap.oauthState=${nonce}; path=/; max-age=600; SameSite=Lax`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user repo",
      state,
    })

    console.log("[Web3Auth] Redirecting to GitHub OAuth...")
    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  const disconnect = () => {
    clearSessionToken()
    window.localStorage.removeItem("gitrap.oauthState")
    window.localStorage.removeItem("gitrap.pendingWallet")
    setProfile(null)
    setWalletAddress(null)
    disconnectWallet()
    router.push("/onboarding")
  }

  const value = useMemo<Web3AuthContextType>(
    () => ({
      address: walletAddress ?? address ?? profile?.walletAddress ?? null,
      githubHandle: profile?.githubUsername ?? null,
      profile,
      isConnectingWallet: isConnectingWallet || (!isConnected && false),
      isConnectingGithub,
      walletError,
      connectWallet,
      connectGithub,
      disconnect,
    }),
    [walletAddress, address, profile, isConnectingWallet, isConnected, isConnectingGithub, walletError]
  )

  return <Web3AuthContext.Provider value={value}>{children}</Web3AuthContext.Provider>
}

export function useWeb3Auth() {
  const ctx = useContext(Web3AuthContext)
  if (!ctx) throw new Error("useWeb3Auth must be used within Web3AuthProvider")
  return ctx
}
