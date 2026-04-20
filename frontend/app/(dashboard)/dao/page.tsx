"use client"

import { useState } from "react"
import { Search, Filter, ShieldCheck, Star, Zap, Github, ChevronDown } from "lucide-react"

const MOCK_CONTRIBUTORS = [
  { username: "dev_wizard",    role: "Core Protocol Dev", skills: ["Rust", "Solidity"], score: 8421, repos: 24, available: true },
  { username: "0xdesigner",    role: "Frontend Engineer", skills: ["React", "CSS3"], score: 6490, repos: 15, available: false },
  { username: "smart_cont_bob",role: "Security Auditor",  skills: ["Vyper", "EVM"], score: 5420, repos: 12, available: true },
  { username: "solana_rust",   role: "Systems Engineer",  skills: ["Rust", "C++"], score: 7904, repos: 30, available: true },
  { username: "zk_hacker",     role: "Cryptography Research",skills: ["ZK-SNARKs", "Math"], score: 4890, repos: 8, available: true },
  { username: "web3_punk",     role: "Fullstack Dev",     skills: ["Go", "React"], score: 3820, repos: 42, available: false },
  { username: "vitalik",       role: "Protocol Architect",skills: ["Python", "Solidity"], score: 9852, repos: 104, available: false },
  { username: "front_end_andy",role: "UI Developer",      skills: ["Vue", "Tailwind"], score: 5120, repos: 19, available: true },
]

export default function DaoDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
           <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-[#2d3436]">
             <ShieldCheck className="w-8 h-8 text-[#ff4757]" /> Talent Discovery
           </h1>
           <p className="text-[#4a5568] max-w-xl leading-relaxed">
             Find verified Web3 developers based on their on-chain GitHub reputation and verifiable contributions.
           </p>
        </div>
      </div>

      {/* Control Panel (Search & Filters) */}
      <div className="industrial-card p-4 flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
           <input 
              type="text" 
              placeholder="Search developers, skills, or roles..."
              className="industrial-input w-full pl-12 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex gap-4">
           {/* Skill Filter Dropdown (Mock) */}
           <div className="relative">
             <button className="h-12 px-6 bg-[#d1d9e6]/50 border border-[#a3b1c6]/40 rounded-lg flex items-center gap-3 font-bold text-sm tracking-widest text-[#2d3436] hover:bg-[#e0e5ec] transition-colors">
                <Filter className="w-4 h-4" /> SKILLS <ChevronDown className="w-4 h-4 text-[#4a5568]" />
             </button>
           </div>
           
           {/* Score Filter Dropdown (Mock) */}
           <div className="relative">
             <button className="h-12 px-6 bg-[#d1d9e6]/50 border border-[#a3b1c6]/40 rounded-lg flex items-center gap-3 font-bold text-sm tracking-widest text-[#2d3436] hover:bg-[#e0e5ec] transition-colors">
                <Star className="w-4 h-4" /> MIN SCORE: 5K <ChevronDown className="w-4 h-4 text-[#4a5568]" />
             </button>
           </div>
        </div>
      </div>

      {/* Grid of Contributors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_CONTRIBUTORS.map((dev, i) => (
          <div key={i} className="industrial-card flex flex-col pt-6 pb-0 overflow-hidden group">
            
            <div className="px-6 flex justify-between items-start mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#e0e5ec] shadow-[var(--shadow-card)] overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${dev.username}`} alt="avatar" />
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase shadow-[var(--shadow-recessed)] ${dev.available ? "bg-green-100 text-green-700" : "bg-[#d1d9e6] text-[#4a5568]"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${dev.available ? "bg-green-500 animate-pulse" : "bg-[#4a5568]"}`} />
                  {dev.available ? "AVAILABLE" : "HIRED"}
                </div>
              </div>
            </div>

            <div className="px-6 mb-4">
              <h3 className="font-bold text-lg tracking-tight mb-1">{dev.username}</h3>
              <p className="text-xs font-mono text-[#4a5568]">{dev.role}</p>
            </div>

            {/* Skills */}
            <div className="px-6 flex flex-wrap gap-2 mb-6">
               {dev.skills.map(s => (
                 <span key={s} className="px-2 py-1 bg-[#d1d9e6]/50 border border-[#a3b1c6]/30 text-[#2d3436] rounded text-[10px] font-mono tracking-widest shadow-sm">
                   {s}
                 </span>
               ))}
            </div>

            {/* Metrics Strip */}
            <div className="mt-auto grid grid-cols-2 border-t border-[#a3b1c6]/30 bg-[#d1d9e6]/20 py-3">
               <div className="flex flex-col items-center border-r border-[#a3b1c6]/30">
                 <div className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-0.5 flex flex-center gap-1"><Zap className="w-3 h-3"/> REP SCORE</div>
                 <div className="font-mono font-bold text-[#ff4757]">{dev.score}</div>
               </div>
               <div className="flex flex-col items-center">
                 <div className="text-[10px] font-bold tracking-widest text-[#4a5568] mb-0.5 flex flex-center gap-1"><Github className="w-3 h-3"/> REPOS</div>
                 <div className="font-mono font-bold text-[#2d3436]">{dev.repos}</div>
               </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
