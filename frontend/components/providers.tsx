"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { Web3AuthProvider } from '@/hooks/useWeb3Auth'
import React, { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3AuthProvider>
          {children}
        </Web3AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
