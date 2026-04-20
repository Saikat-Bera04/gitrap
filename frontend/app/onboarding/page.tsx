"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Github, Wallet, Check, ArrowRight, Loader2 } from "lucide-react"
import { useWeb3Auth } from "@/hooks/useWeb3Auth"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isFinishing, setIsFinishing] = useState(false)
  const router = useRouter()
  
  const { 
    address, 
    githubHandle, 
    isConnectingWallet, 
    isConnectingGithub, 
    connectWallet, 
    connectGithub 
  } = useWeb3Auth()

  // Auto-advance
  useEffect(() => {
    if (address && !githubHandle) setStep(2)
    if (address && githubHandle) setStep(3)
  }, [address, githubHandle])

  const handleConfirm = () => {
    setIsFinishing(true)
    setTimeout(() => {
      router.push("/dashboard")
    }, 1200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#e0e5ec]">
      <div className="w-full max-w-lg">
        {/* Progress System */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-3 rounded-full bg-[#d1d9e6] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] hidden md:block z-0" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-[var(--shadow-floating)] transition-colors duration-300 ${
                  step >= i ? "bg-[#ff4757] text-white" : "bg-[#e0e5ec] text-[#4a5568]"
                }`}
              >
                {step > i ? <Check size={20} /> : i}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-mono ${step >= i ? "text-[#2d3436]" : "text-[#4a5568]"}`}>
                {i === 1 ? "Wallet" : i === 2 ? "GitHub" : "Confirm"}
              </span>
            </div>
          ))}
        </div>

        {/* Panel Container */}
        <div className="industrial-card p-10 min-h-[420px] flex flex-col">
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8 text-[#ff4757]" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Connect Web3 Wallet</h2>
              <button 
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="industrial-button industrial-button-primary w-full flex items-center justify-center gap-2 h-14 relative overflow-hidden group"
              >
                {isConnectingWallet ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Connect Wallet <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></>
                )}
                {/* Physical edge detail */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mb-6">
                <Github className="w-8 h-8 text-[#ff4757]" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Connect GitHub</h2>
              <p className="text-[#4a5568] mb-10 max-w-[280px] leading-relaxed">
                Link your GitHub to calculate your on-chain reputation based on real commits.
              </p>
              <button 
                onClick={connectGithub}
                disabled={isConnectingGithub}
                className="industrial-button industrial-button-primary w-full flex items-center justify-center gap-2 h-14 relative overflow-hidden group bg-[#2d3436]"
              >
                {isConnectingGithub ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Authorize GitHub <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-50 shadow-[var(--shadow-glow-green)] flex items-center justify-center mb-6 border border-green-200">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Identity Secured</h2>
              <p className="text-[#4a5568] mb-8 max-w-[280px] leading-relaxed">
                Wallet and GitHub verified. We are generating your base reputation score.
              </p>
              
              <div className="w-full bg-[#d1d9e6] rounded-full h-3 mb-10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className={`h-full rounded-full w-full transition-all duration-1000 ${isFinishing ? "bg-green-500" : "bg-[#ff4757] animate-[pulse_2s_ease-in-out_infinite]"}`} />
              </div>

              <button 
                onClick={handleConfirm}
                disabled={isFinishing}
                className="industrial-button industrial-button-primary w-full flex items-center justify-center gap-2 h-14"
              >
                {isFinishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Dashboard <ArrowRight className="w-4 h-4 ml-1" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
