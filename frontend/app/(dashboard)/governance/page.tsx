"use client"

import { useState } from "react"
import { Search, ChevronDown, Plus, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react"

const MOCK_PROPOSALS = [
  { name: "Treasury Integration", status: "Ongoing", timeLeft: "24hrs 16mins", votes: "10,002", for: "9,182", against: "823" },
  { name: "GitRap V2 Upgrade", status: "Cancelled", timeLeft: "Completed", votes: "30,123", for: "11,345", against: "18,778" },
  { name: "Add Avalanche Rank", status: "Successful", timeLeft: "Completed", votes: "72,669", for: "60,810", against: "11,859" },
  { name: "Allocate Bounties #4", status: "Ongoing", timeLeft: "24hrs 16mins", votes: "28,012", for: "14,111", against: "13,901" },
  { name: "Adjust Score Alg", status: "Cancelled", timeLeft: "Completed", votes: "5,123", for: "2,433", against: "2,690" },
  { name: "Onboard Polygon", status: "Successful", timeLeft: "Completed", votes: "41,088", for: "39,748", against: "1,340" },
]

export default function GovernancePage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[#a3b1c6]/30 pb-6">
        <div>
           <h1 className="text-3xl font-bold tracking-tight mb-1 text-[#2d3436]">Governance Proposals</h1>
           <p className="text-[#4a5568] text-sm">Vote on GitRap protocol upgrades and treasury allocations using your SBT.</p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="industrial-card p-6 flex flex-col justify-between">
           <div className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold mb-3">Total Proposals</div>
           <div className="font-mono text-4xl font-bold text-[#2d3436]">623</div>
           <div className="flex items-center gap-2 mt-4 text-[9px] text-[#4a5568] uppercase font-mono tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-[#a3b1c6]" /> Last updated: 1 min ago
           </div>
        </div>
        
        <div className="industrial-card p-6 flex flex-col justify-between">
           <div className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold mb-3">Approved</div>
           <div className="font-mono text-4xl font-bold text-green-600">510</div>
           <div className="flex items-center gap-2 mt-4 text-[9px] text-[#4a5568] uppercase font-mono tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-[#a3b1c6]" /> Last updated: 1 min ago
           </div>
        </div>

        <div className="industrial-card p-6 flex flex-col justify-between">
           <div className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold mb-3">Rejected</div>
           <div className="font-mono text-4xl font-bold text-[#ff4757]">113</div>
           <div className="flex items-center gap-2 mt-4 text-[9px] text-[#4a5568] uppercase font-mono tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-[#a3b1c6]" /> Last updated: 1 min ago
           </div>
        </div>

        <div className="industrial-card p-6 flex flex-col justify-between relative border border-[#ff4757]/20">
           <div className="text-[10px] uppercase tracking-widest text-[#ff4757] font-bold mb-3">My Proposals</div>
           <div className="font-mono text-4xl font-bold text-[#2d3436]">10</div>
           <button className="industrial-button industrial-button-secondary py-2 px-4 text-[10px] mt-4 shadow-sm w-max hover:bg-[#d1d9e6]">
             VIEW ALL
           </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="industrial-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
         
         {/* Search */}
         <div className="flex-1 relative w-full md:max-w-md">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
           <input 
              type="text" 
              placeholder="Search for proposals..."
              className="industrial-input w-full pl-12 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="flex gap-4 w-full md:w-auto items-center">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#4a5568] font-bold uppercase hidden md:block">Filter</span>
              <button className="h-12 px-4 bg-[#d1d9e6]/50 border border-[#a3b1c6]/30 rounded-lg flex items-center justify-between min-w-[140px] text-xs font-bold text-[#2d3436] hover:bg-[#d1d9e6] transition-colors">
                 Recent <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-[#4a5568] font-bold uppercase hidden md:block">Sort</span>
              <button className="h-12 px-4 bg-[#d1d9e6]/50 border border-[#a3b1c6]/30 rounded-lg flex items-center justify-between min-w-[140px] text-xs font-bold text-[#2d3436] hover:bg-[#d1d9e6] transition-colors">
                 Ascending <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </button>
            </div>

            {/* Create Button */}
            <button className="industrial-button py-0 h-12 bg-[#2d3436] border border-[#2d3436] text-[#e0e5ec] hover:bg-black hover:border-black flex items-center gap-2 shadow-[var(--shadow-card)] ml-auto md:ml-4 flex-shrink-0">
               <Plus className="w-4 h-4" /> CREATE
            </button>
         </div>
      </div>

      {/* Data Table */}
      <div className="industrial-card overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-[#d1d9e6]/30 border-b border-[#a3b1c6]/30 text-[10px] font-bold tracking-widest text-[#4a5568] uppercase font-mono items-center gap-4">
           <div className="col-span-3">Proposal</div>
           <div className="col-span-2">Status</div>
           <div className="col-span-2">Time Left</div>
           <div className="col-span-1 text-center">Total Votes</div>
           <div className="col-span-1 text-center">Votes For</div>
           <div className="col-span-2 text-center">Votes Against</div>
           <div className="col-span-1 text-right">Vote</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#a3b1c6]/20">
           {MOCK_PROPOSALS.map((prop, i) => {
             // Derive status colors
             let statusBg = "bg-[#d1d9e6]/80 text-[#4a5568]"
             let statusDot = "bg-[#4a5568]"
             if(prop.status === "Ongoing") { statusBg = "bg-amber-100/80 text-amber-800"; statusDot = "bg-amber-500 animate-pulse" }
             if(prop.status === "Successful") { statusBg = "bg-green-100/80 text-green-800"; statusDot = "bg-green-500" }
             if(prop.status === "Cancelled") { statusBg = "bg-red-100/80 text-red-800"; statusDot = "bg-[#ff4757]" }

             return (
             <div 
                key={i}
                className="grid grid-cols-12 px-6 py-5 items-center hover:bg-[#fafaf8]/50 transition-colors group gap-4 font-mono text-sm"
             >
               {/* Name */}
               <div className="col-span-3 flex items-center gap-2 font-bold text-[#2d3436] font-sans tracking-tight cursor-pointer hover:underline">
                 {prop.name} <ExternalLink className="w-3 h-3 text-[#4a5568]" />
               </div>

               {/* Status Pill */}
               <div className="col-span-2">
                 <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase shadow-[var(--shadow-recessed)] ${statusBg}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                   {prop.status}
                 </div>
               </div>

               {/* Time Left */}
               <div className="col-span-2 text-[#4a5568] text-xs">
                 {prop.timeLeft}
               </div>

               {/* Stats */}
               <div className="col-span-1 text-center font-bold text-[#2d3436]">{prop.votes}</div>
               <div className="col-span-1 text-center text-green-600">{prop.for}</div>
               <div className="col-span-2 text-center text-[#ff4757]">{prop.against}</div>

               {/* Actions */}
               <div className="col-span-1 flex items-center justify-end gap-2">
                  <button className="w-8 h-8 rounded bg-[#e0e5ec] shadow-[var(--shadow-card)] flex items-center justify-center text-green-600 hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)] active:translate-y-0 active:shadow-[var(--shadow-pressed)] transition-all">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded bg-[#e0e5ec] shadow-[var(--shadow-card)] flex items-center justify-center text-[#ff4757] hover:-translate-y-0.5 hover:shadow-[var(--shadow-floating)] active:translate-y-0 active:shadow-[var(--shadow-pressed)] transition-all">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
               </div>
             </div>
           )})}
        </div>
      </div>

    </div>
  )
}
