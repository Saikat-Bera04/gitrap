"use client"

import { useState } from "react"
import { Settings as SettingsIcon, Github, Wallet, RefreshCw, Power } from "lucide-react"

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [githubConnected, setGithubConnected] = useState(true)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center gap-4 mb-10 border-b border-[#a3b1c6]/30 pb-6">
        <SettingsIcon className="w-8 h-8 text-[#2d3436]" />
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-[#2d3436]">System Config</h1>
           <p className="text-[#4a5568]">Manage your connections and data synchronization.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Connection Panel */}
        <div className="industrial-card p-8">
           <h3 className="text-sm font-bold tracking-widest text-[#4a5568] uppercase mb-6 flex items-center gap-2">
             <Power className="w-4 h-4" /> Connections
           </h3>

           <div className="space-y-6">
              {/* GitHub Connection */}
              <div className="flex items-center justify-between p-4 bg-[#e0e5ec] rounded-xl shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#d1d9e6] shadow-[var(--shadow-card)] flex items-center justify-center">
                     <Github className="w-5 h-5 text-[#2d3436]" />
                   </div>
                   <div>
                     <div className="font-bold text-sm tracking-wide">GitHub</div>
                     <div className="text-xs text-[#4a5568] font-mono">dev_wizard</div>
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => setGithubConnected(!githubConnected)}
                   className={`industrial-button px-4 py-2 text-[10px] ${githubConnected ? "industrial-button-secondary" : "industrial-button-primary"}`}
                 >
                   {githubConnected ? "DISCONNECT" : "RECONNECT"}
                 </button>
              </div>

              {/* Wallet Connection */}
              <div className="flex items-center justify-between p-4 bg-[#e0e5ec] rounded-xl shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#d1d9e6] shadow-[var(--shadow-card)] flex items-center justify-center">
                     <Wallet className="w-5 h-5 text-[#2d3436]" />
                   </div>
                   <div>
                     <div className="font-bold text-sm tracking-wide">Web3 Wallet</div>
                     <div className="text-xs text-[#4a5568] font-mono">0x1F4...A9C</div>
                   </div>
                 </div>
                 
                 <button className="industrial-button industrial-button-secondary px-4 py-2 text-[10px]">
                   CHANGE WALLET
                 </button>
              </div>
           </div>
        </div>

        {/* Data Sync Panel */}
        <div className="space-y-8">
           <div className="industrial-card p-8">
              <h3 className="text-sm font-bold tracking-widest text-[#4a5568] uppercase mb-4 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Data Sync
              </h3>
              <p className="text-sm text-[#4a5568] mb-6 leading-relaxed">
                 Force a manual sync of your on-chain reputation based on the latest GitHub activity. 
                 This process may take a few minutes as we aggregate and verify data.
              </p>
              
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="industrial-button industrial-button-primary w-full flex justify-center items-center gap-2 py-4"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /> 
                {isRefreshing ? "SYNCING DATA..." : "SYNC GITHUB ACTIVITY"}
              </button>

              <div className="mt-4 text-[10px] font-mono text-center tracking-widest text-[#4a5568] opacity-70">
                LAST SYNC: 2 HOURS AGO
              </div>
           </div>

           {/* Danger Zone */}
           <div className="industrial-card p-8 border-2 border-[#ff4757]/30 bg-[#ff4757]/5">
              <h3 className="text-sm font-bold tracking-widest text-[#ff4757] uppercase mb-4">Danger Zone</h3>
              <p className="text-xs text-[#4a5568] mb-6 leading-relaxed">
                 Deleting your account will remove all off-chain metadata. Your SBTs will remain on-chain, but will no longer be linked to our dashboard.
              </p>
              
              <button className="industrial-button px-6 py-2 text-xs bg-[#ff4757] text-white shadow-[var(--shadow-glow)] hover:bg-[#ff4757] w-full">
                DELETE ACCOUNT
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}
