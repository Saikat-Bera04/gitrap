"use client"

import { RefreshCw, Share2, Award, Github, GitPullRequest, Star, CircleDot } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Top Banner / Profile Summary */}
      <div className="industrial-card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full border-4 border-[#e0e5ec] shadow-[var(--shadow-floating)] overflow-hidden shrink-0 relative">
          <img src="https://api.dicebear.com/7.x/identicon/svg?seed=0x1F" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#a3b1c6]/30 pb-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">dev_wizard</h1>
              <div className="font-mono text-sm tracking-wide text-[#4a5568]">0x1F4...A9C</div>
            </div>
            
            <div className="flex gap-3">
              <button className="industrial-button industrial-button-secondary text-[11px] p-3 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-2" /> REFRESH
              </button>
              <button className="industrial-button industrial-button-primary text-[11px] p-3 flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" /> SHARE
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className="font-mono text-xs tracking-widest text-[#4a5568] uppercase">ON-CHAIN REPUTATION</span>
            <div className="font-mono text-4xl font-bold text-[#ff4757] drop-shadow-md">842</div>
            <div className="px-3 py-1 bg-[#d1d9e6] rounded text-[10px] font-bold tracking-widest uppercase shadow-[var(--shadow-recessed)]">
              TOP 5%
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Commits", value: "1,204", icon: Github },
          { label: "Pull Requests", value: "84", icon: GitPullRequest },
          { label: "Issues Resolved", value: "142", icon: CircleDot },
          { label: "Stars Earned", value: "3.2k", icon: Star },
        ].map((stat, i) => (
          <div key={i} className="industrial-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full mb-4 bg-[#e0e5ec] shadow-[var(--shadow-recessed)] flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-[#ff4757]" />
            </div>
            <div className="font-mono text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs font-bold tracking-widest text-[#4a5568] uppercase font-mono">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Stats Area */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Activity Chart Area */}
        <div className="md:col-span-2 industrial-card p-8 flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Activity Timeline</h3>
              <div className="px-3 py-1 bg-[#d1d9e6] rounded text-[10px] font-mono tracking-widest shadow-[var(--shadow-recessed)]">
                LAST 30 DAYS
              </div>
           </div>
           
           <div className="flex-1 bg-[#d1d9e6]/30 rounded-xl shadow-[var(--shadow-recessed)] flex items-end p-4 gap-2 h-64 border border-[#a3b1c6]/20">
             {/* Mock Chart Bars */}
             {Array.from({length: 30}).map((_, i) => (
                <div key={i} className="flex-1 bg-[#e0e5ec] shadow-[var(--shadow-floating)] rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%`}}>
                  <div className={`w-full h-full rounded-t-sm transition-opacity duration-300 ${Math.random() > 0.7 ? "bg-[#ff4757]/80" : "bg-[#a3b1c6]/20"}`} />
                </div>
             ))}
           </div>
        </div>

        {/* Reputation Breakdown Layer */}
        <div className="industrial-card p-8 flex flex-col">
          <h3 className="font-bold text-lg mb-6 drop-shadow-sm">Scoring Breakdown</h3>
          
          <div className="space-y-6 flex-1">
            {[
              { label: "Code Contribution", pts: 420 },
              { label: "Community Impact", pts: 215 },
              { label: "Project Maintenance", pts: 147 },
              { label: "Consistency Margin", pts: 60 }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between font-mono text-sm mb-2">
                  <span className="text-[#4a5568]">{item.label}</span>
                  <span className="font-bold text-[#2d3436]">+{item.pts}</span>
                </div>
                <div className="h-2 rounded-full shadow-[var(--shadow-recessed)] bg-[#d1d9e6] overflow-hidden">
                   <div className="h-full bg-[#ff4757]" style={{ width: `${(item.pts / 500) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#a3b1c6]/30 text-center">
             <button className="industrial-button industrial-button-primary w-full shadow-lg gap-2 text-xs flex justify-center items-center">
                <Award className="w-4 h-4" /> MINT LATEST SBT
             </button>
          </div>
        </div>

      </div>

    </div>
  )
}
