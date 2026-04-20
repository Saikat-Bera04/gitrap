"use client"

import { useEffect, useState } from "react"
import { Hexagon, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { useMintReputation } from "@/hooks/useMintReputation"
import { apiFetch, shortenAddress, type UserProfile } from "@/lib/api"

export default function MintPage() {
  const { mint, isPending, isConfirming, isSuccess, error, hash } = useMintReputation()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<UserProfile>("/api/user/profile")
      .then(setUser)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Unable to load profile"))
  }, [])

  const handleMint = () => {
    if (!user?.stats) return

    mint(
      user.score,
      user.stats.commits,
      user.stats.pullRequests,
      user.stats.issues,
      user.githubUsername
    )
  }

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ""
  const shortContract = contractAddress ? shortenAddress(contractAddress) : "Not set"

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      
      <div className="text-center max-w-2xl mx-auto pt-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-[#2d3436] flex justify-center items-center gap-3">
          Mint Your Developer Identity
        </h1>
        <p className="text-[#4a5568] leading-relaxed">
          Claim your Soulbound Token (SBT). This non-transferable NFT represents your 
          verifiable on-chain reputation and unlocks access to exclusive DAOs and bounties.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        
        {/* NFT Preview Card (The Asset) */}
        <div className="relative group perspective-1000">
           {/* Card Container simulating 3D tilt */}
           <div className="industrial-card relative z-10 w-full max-w-sm mx-auto aspect-[3/4] bg-gradient-to-b from-[#2d3436] to-[#1a1f22] text-[#e0e5ec] overflow-hidden border-2 border-[#ff4757]/20 transition-transform duration-500 hover:rotate-y-6 hover:-rotate-x-6 hover:shadow-[0_20px_40px_rgba(255,71,87,0.2)]">
              
              {/* Scanline texture */}
              <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.5) 50%)", backgroundSize: "100% 4px" }} />
              
              {/* Top Banner */}
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
                 <div className="font-mono text-xs tracking-widest text-[#a8b2d1]">GITRAP_SBT</div>
                 <Hexagon className="w-6 h-6 text-[#ff4757]" />
              </div>

              {/* Center Content */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                <div className="w-24 h-24 rounded-full border-4 border-[#ff4757]/80 shadow-[0_0_20px_rgba(255,71,87,0.5)] overflow-hidden bg-[#e0e5ec] mb-4">
                  <img src={user?.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.walletAddress ?? "gitrap"}`} className="w-full h-full object-cover mix-blend-luminosity opacity-90" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">{user?.githubUsername ?? "Connect GitHub"}</h3>
                
                <div className="flex gap-4 mt-6 w-full px-8">
                   <div className="flex-1 text-center bg-black/40 rounded-lg py-3 backdrop-blur-md border border-white/10">
                     <div className="text-[10px] text-[#a8b2d1] font-mono tracking-widest mb-1">SCORE</div>
                     <div className="text-xl font-bold font-mono text-[#ff4757]">{user?.score ?? "--"}</div>
                   </div>
                   <div className="flex-1 text-center bg-black/40 rounded-lg py-3 backdrop-blur-md border border-white/10">
                     <div className="text-[10px] text-[#a8b2d1] font-mono tracking-widest mb-1">RANK</div>
                     <div className="text-xl font-bold font-mono">#2</div>
                   </div>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/10 bg-black/20 backdrop-blur-md z-20">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#a8b2d1]">
                   <span>{user ? shortenAddress(user.walletAddress) : "0x..."}</span>
                   <span>GEN: 1</span>
                </div>
              </div>
           </div>

           {/* Holographic background glow */}
           <div className="absolute inset-0 w-full max-w-sm mx-auto aspect-[3/4] bg-[#ff4757] opacity-20 blur-3xl -z-10 rounded-3xl group-hover:opacity-40 transition-opacity duration-500" />
        </div>

        {/* Mint Controls */}
        <div className="space-y-8">
           <div className="industrial-card p-8">
             <h3 className="font-bold text-xl mb-6 tracking-tight">Transaction Details</h3>
             
             <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-[#a3b1c6]/30 pb-3">
                  <span className="text-[#4a5568]">Network</span>
                  <span className="font-bold">Sepolia</span>
                </div>
                <div className="flex justify-between border-b border-[#a3b1c6]/30 pb-3">
                  <span className="text-[#4a5568]">Contract</span>
                  <span className="font-bold">{shortContract}</span>
                </div>
                <div className="flex justify-between pb-3">
                  <span className="text-[#4a5568]">Est. Gas Fee</span>
                  <span className="font-bold">~0.0001 ETH</span>
                </div>
             </div>

             <div className="mt-8">
               {loadError && (
                 <div className="w-full py-4 bg-red-50 text-red-700 border-2 border-[#ff4757] rounded-xl font-bold tracking-widest text-center">
                   {loadError}
                 </div>
               )}

               {!loadError && !user && (
                 <button disabled className="industrial-button industrial-button-secondary w-full py-4 text-base tracking-widest opacity-80 cursor-not-allowed flex items-center justify-center gap-2">
                   <Loader2 className="w-5 h-5 animate-spin text-[#ff4757]" /> LOADING SCORE...
                 </button>
               )}

               {user && (!isPending && !isConfirming && !isSuccess && !error) && (
                 <button 
                   onClick={handleMint}
                   className="industrial-button industrial-button-primary w-full py-4 text-base tracking-widest shadow-lg flex items-center justify-center gap-2"
                 >
                   <Hexagon className="w-5 h-5" /> MINT IDENTITY NOW
                 </button>
               )}

               {isPending && (
                 <button disabled className="industrial-button industrial-button-secondary w-full py-4 text-base tracking-widest opacity-80 cursor-not-allowed flex items-center justify-center gap-2">
                   <Loader2 className="w-5 h-5 animate-spin text-[#ff4757]" /> WAITING FOR WALLET...
                 </button>
               )}

               {isConfirming && (
                 <button disabled className="industrial-button industrial-button-secondary w-full py-4 text-base tracking-widest opacity-80 cursor-not-allowed flex flex-col items-center justify-center gap-1">
                   <div className="flex items-center gap-2">
                     <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> CONFIRMING ON-CHAIN...
                   </div>
                   {hash && (
                     <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" className="text-[10px] text-amber-600 hover:underline flex items-center gap-1 font-mono tracking-widest lowercase">
                       view on etherscan <ExternalLink className="w-3 h-3" />
                     </a>
                   )}
                 </button>
               )}

               {isSuccess && (
                 <div className="w-full py-4 bg-green-50 text-green-700 border-2 border-green-500 rounded-xl font-bold tracking-widest text-center flex flex-col items-center justify-center gap-2 shadow-[var(--shadow-glow-green)]">
                   <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> MINT SUCCESSFUL</div>
                   {hash && (
                     <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" className="text-[10px] text-green-700/70 hover:underline flex items-center gap-1 font-mono tracking-widest lowercase">
                       view on etherscan <ExternalLink className="w-3 h-3" />
                     </a>
                   )}
                 </div>
               )}

               {error && (
                 <div className="w-full flex flex-col gap-3">
                   <div className="flex-1 py-4 bg-red-50 text-red-700 border-2 border-[#ff4757] rounded-xl font-bold tracking-widest text-center flex flex-col items-center justify-center shadow-[var(--shadow-glow)]">
                     <div className="flex items-center gap-2 mb-1"><AlertCircle className="w-5 h-5" /> REJECTED / FAILED</div>
                     <span className="text-[9px] font-mono leading-none tracking-normal lowercase truncate px-4 max-w-full opacity-60">
                       {error.message.split('\n')[0]}
                     </span>
                   </div>
                   <button 
                     onClick={handleMint}
                     className="industrial-button industrial-button-primary"
                   >
                     RETRY MINT
                   </button>
                 </div>
               )}
             </div>
           </div>

           <div className="px-6 py-4 bg-[#d1d9e6]/50 rounded-xl border border-[#a3b1c6]/30 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-[#ff4757] shrink-0 mt-0.5" />
             <p className="text-xs text-[#4a5568] leading-relaxed">
               This is a Soulbound Token (SBT). Once minted, it cannot be transferred to another wallet. 
               Your reputation score will automatically update on this token as your GitHub activity progresses.
             </p>
           </div>
        </div>

      </div>
    </div>
  )
}
