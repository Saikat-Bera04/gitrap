"use client"
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { REPUTATION_NFT_ABI } from '@/lib/abi'

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export function useMintReputation() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const mint = (
    score: number,
    commits: number,
    prs: number,
    issues: number,
    githubUsername: string
  ) => {
    // Auto-switch to Sepolia if on wrong network
    if (chainId !== sepolia.id) {
      if(switchChain) {
         switchChain({ chainId: sepolia.id })
      }
      return
    }

    if (!CONTRACT) {
       console.error("No CONTRACT address provided in .env");
       return;
    }

    writeContract({
      address: CONTRACT,
      abi: REPUTATION_NFT_ABI,
      functionName: 'mintReputation',
      args: [
        BigInt(score),
        BigInt(commits),
        BigInt(prs),
        BigInt(issues),
        githubUsername,
      ],
    })
  }

  return {
    mint,
    hash,
    isPending,     // user signing in MetaMask
    isConfirming,  // tx on-chain, waiting for block
    isSuccess,     // confirmed ✅
    isConnected,
    error,
  }
}
