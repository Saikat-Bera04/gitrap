"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

type Web3AuthContextType = {
  address: string | null
  githubHandle: string | null
  isConnectingWallet: boolean
  isConnectingGithub: boolean
  connectWallet: () => Promise<void>
  connectGithub: () => Promise<void>
  disconnect: () => void
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [githubHandle, setGithubHandle] = useState<string | null>(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const router = useRouter()

  const connectWallet = async () => {
    setIsConnectingWallet(true)
    // Placeholder for actual Wagmi / Ethers / Privy logic
    await new Promise(resolve => setTimeout(resolve, 1200))
    setAddress("0x1F4...A9C")
    setIsConnectingWallet(false)
  }

  const connectGithub = async () => {
    setIsConnectingGithub(true)
    // Placeholder for actual OAuth logic
    await new Promise(resolve => setTimeout(resolve, 1500))
    setGithubHandle("dev_wizard")
    setIsConnectingGithub(false)
  }

  const disconnect = () => {
    setAddress(null)
    setGithubHandle(null)
    router.push("/onboarding")
  }

  return (
    <Web3AuthContext.Provider value={{
      address,
      githubHandle,
      isConnectingWallet,
      isConnectingGithub,
      connectWallet,
      connectGithub,
      disconnect
    }}>
      {children}
    </Web3AuthContext.Provider>
  )
}

export function useWeb3Auth() {
  const ctx = useContext(Web3AuthContext)
  if (!ctx) throw new Error("useWeb3Auth must be used within Web3AuthProvider")
  return ctx
}
