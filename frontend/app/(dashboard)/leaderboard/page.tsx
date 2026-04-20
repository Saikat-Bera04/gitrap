"use client"

import { useState } from "react"
import { Trophy, Medal, ChevronRight, Search } from "lucide-react"

const MOCK_LEADERBOARD = [
  { rank: 1, username: "vitalik", address: "0xd8d...39ab", score: 9852, top: true, trend: "+125" },
  { rank: 2, username: "dev_wizard", address: "0x1F4...A9C", score: 8421, top: true, trend: "+84"  },
  { rank: 3, username: "solana_rust", address: "5H9m...zQk2", score: 7904, top: true, trend: "+42" },
  { rank: 4, username: "frobisher99", address: "0xaa2...11b2", score: 6512, top: false, trend: "+12" },
  { rank: 5, username: "0xdesigner", address: "0x88c...b22c", score: 6490, top: false, trend: "+90" },
  { rank: 6, username: "hacker_boi", address: "0x11a...3a1c", score: 5880, top: false, trend: "-10" },
  { rank: 7, username: "smart_cont_bob", address: "0xbbb...9c8b", score: 5420, top: false, trend: "+10" },
  { rank: 8, username: "front_end_andy", address: "0xccc...3d7e", score: 5120, top: false, trend: "+5" },
]

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All-time")

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header section with filters */}
      <div className="industrial-card p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
             <Trophy className="w-6 h-6 text-[#ff4757]" /> Global Leaderboard
           </h1>
           <p className="text-[#4a5568] text-sm mt-1">Top verified developers by tracked on-chain activity.</p>
        </div>
        
        <div className="flex bg-[#d1d9e6]/50 p-1 rounded-xl shadow-[var(--shadow-recessed)] border border-[#a3b1c6]/30">
           {["Weekly", "Monthly", "All-time"].map((f) => (
             <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${
                  filter === f 
                    ? "bg-[#e0e5ec] text-[#ff4757] shadow-[var(--shadow-floating)]" 
                    : "text-[#4a5568] hover:text-[#2d3436]"
                }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="flex gap-4">
         <div className="flex-1 relative">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
           <input 
              type="text" 
              placeholder="Search by username or address..."
              className="industrial-input w-full pl-12 h-14"
            />
         </div>
      </div>

      {/* Main Table */}
      <div className="industrial-card overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-[#d1d9e6]/30 border-b border-[#a3b1c6]/30 text-xs font-bold tracking-widest text-[#4a5568] uppercase font-mono">
           <div className="col-span-2 md:col-span-1 text-center">Rank</div>
           <div className="col-span-6 md:col-span-5">Identity</div>
           <div className="col-span-4 md:col-span-3 text-right">Reputation</div>
           <div className="hidden md:block col-span-2 text-right">Trend</div>
           <div className="hidden md:block col-span-1"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#a3b1c6]/20">
           {MOCK_LEADERBOARD.map((user, i) => (
             <div 
                key={i}
                className="grid grid-cols-12 px-6 py-5 items-center hover:bg-[#fafaf8]/50 transition-colors cursor-pointer group"
             >
               {/* Rank */}
               <div className="col-span-2 md:col-span-1 flex justify-center">
                 {user.top ? (
                   <div className="w-8 h-8 rounded-full bg-[#ff4757]/10 flex items-center justify-center border border-[#ff4757]/30 shadow-[var(--shadow-glow)]">
                      <Medal className={`w-4 h-4 ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                   </div>
                 ) : (
                   <span className="font-mono text-[#4a5568] font-bold text-lg">#{user.rank}</span>
                 )}
               </div>

               {/* Identity */}
               <div className="col-span-6 md:col-span-5 flex items-center gap-4 pl-4">
                 <div className="w-10 h-10 rounded-full border-2 border-[#e0e5ec] shadow-[var(--shadow-card)] overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.address}`} alt="avatar" />
                 </div>
                 <div>
                   <div className="font-bold text-[#2d3436] flex items-center gap-2 tracking-tight">
                     {user.username}
                     {user.top && <div className="industrial-led-green w-2 h-2" title="Verified Top Tier" />}
                   </div>
                   <div className="text-xs font-mono text-[#4a5568]">{user.address}</div>
                 </div>
               </div>

               {/* Reputation */}
               <div className="col-span-4 md:col-span-3 text-right">
                  <span className="font-mono text-xl font-bold text-[#2d3436] tracking-tight">{user.score}</span>
               </div>

               {/* Trend */}
               <div className="hidden md:block col-span-2 text-right">
                  <span className={`font-mono text-sm tracking-widest ${user.trend.startsWith('+') ? 'text-green-600' : 'text-[#ff4757]'}`}>
                    {user.trend}
                  </span>
               </div>

               {/* Action / Arrow */}
               <div className="hidden md:flex col-span-1 justify-end">
                  <div className="w-8 h-8 rounded-full bg-[#d1d9e6]/50 flex items-center justify-center text-[#4a5568] group-hover:bg-[#ff4757] group-hover:text-white group-hover:shadow-[var(--shadow-glow)] transition-all">
                    <ChevronRight size={16} />
                  </div>
               </div>
             </div>
           ))}
        </div>

      </div>

    </div>
  )
}
