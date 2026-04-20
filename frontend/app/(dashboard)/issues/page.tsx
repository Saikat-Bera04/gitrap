"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Search, GitPullRequest, Loader2 } from "lucide-react"
import { apiFetch, shortenAddress, type SiteIssue } from "@/lib/api"

export default function IssuesPage() {
  const [issues, setIssues] = useState<SiteIssue[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<SiteIssue[]>("/api/github/site-issues")
      .then(setIssues)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load GitRap-created issues"))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredIssues = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return issues
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(value) ||
        issue.repoFullName.toLowerCase().includes(value) ||
        issue.createdBy.githubUsername.toLowerCase().includes(value)
    )
  }, [issues, query])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#a3b1c6]/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-[#2d3436]">GitRap Issues</h1>
          <p className="text-[#4a5568] text-sm">
            Every GitHub issue created from the GitRap governance workbench appears here.
          </p>
        </div>
      </div>

      <div className="industrial-card p-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="industrial-input w-full pl-12 h-12"
            placeholder="Search by issue, repo, or creator..."
          />
        </div>
      </div>

      <div className="industrial-card overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-4 bg-[#d1d9e6]/30 border-b border-[#a3b1c6]/30 text-[10px] font-bold tracking-widest text-[#4a5568] uppercase font-mono gap-4">
          <div className="col-span-5">Issue</div>
          <div className="col-span-2">Repository</div>
          <div className="col-span-2">Creator</div>
          <div className="col-span-2">State</div>
          <div className="col-span-1 text-right">Open</div>
        </div>

        {isLoading && (
          <div className="p-10 flex justify-center items-center gap-3 text-[#4a5568]">
            <Loader2 className="w-5 h-5 animate-spin text-[#ff4757]" />
            Loading issues
          </div>
        )}

        {error && <div className="p-10 text-center text-[#ff4757] font-mono">{error}</div>}

        {!isLoading && !error && filteredIssues.length === 0 && (
          <div className="p-10 text-center text-[#4a5568]">
            No GitRap-created issues yet. Create one from Governance.
          </div>
        )}

        <div className="divide-y divide-[#a3b1c6]/20">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="grid grid-cols-12 px-6 py-5 items-center gap-4 hover:bg-[#fafaf8]/50">
              <div className="col-span-5 flex items-center gap-2 font-bold">
                <GitPullRequest className="w-4 h-4 text-[#ff4757]" />
                #{issue.githubIssueNumber} {issue.title}
              </div>
              <div className="col-span-2 font-mono text-xs text-[#4a5568] truncate">{issue.repoFullName}</div>
              <div className="col-span-2 flex items-center gap-2">
                <img src={issue.createdBy.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${issue.createdBy.walletAddress}`} className="w-7 h-7 rounded-full" alt="" />
                <div>
                  <div className="font-bold text-sm">{issue.createdBy.githubUsername}</div>
                  <div className="font-mono text-[10px] text-[#4a5568]">{shortenAddress(issue.createdBy.walletAddress)}</div>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${issue.state === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {issue.state}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <a href={issue.url} target="_blank" className="w-8 h-8 rounded bg-[#e0e5ec] shadow-[var(--shadow-card)] flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
