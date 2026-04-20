"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, ChevronDown, Plus, ExternalLink, ThumbsUp, ThumbsDown, Loader2, GitPullRequest } from "lucide-react"
import { apiFetch, type GitHubIssue, type GitHubRepo } from "@/lib/api"

const DEMO_PROPOSALS = [
  { name: "DAO bounty routing for verified maintainers", status: "Ongoing", for: 9182, against: 823 },
  { name: "Retroactive rewards for issue triage", status: "Successful", for: 60810, against: 11859 },
  { name: "Require GitHub proof for protocol grants", status: "Ongoing", for: 14111, against: 13901 }
]

export default function GovernancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [selectedRepo, setSelectedRepo] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadGitHubWork = async () => {
    const [nextRepos, nextIssues] = await Promise.all([
      apiFetch<GitHubRepo[]>("/api/github/repos"),
      apiFetch<GitHubIssue[]>("/api/github/issues")
    ])
    setRepos(nextRepos)
    setIssues(nextIssues)
    setSelectedRepo((current) => current || nextRepos[0]?.fullName || "")
  }

  useEffect(() => {
    loadGitHubWork().catch((err) => {
      setError(err instanceof Error ? err.message : "Connect GitHub to manage governance issues.")
    })
  }, [])

  const filteredIssues = useMemo(() => {
    const value = searchTerm.trim().toLowerCase()
    if (!value) return issues
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(value) ||
        issue.labels.some((label) => label.toLowerCase().includes(value))
    )
  }, [issues, searchTerm])

  const createIssue = async () => {
    if (!selectedRepo || !title.trim()) {
      setError("Select a repository and add an issue title.")
      return
    }

    setIsCreating(true)
    setError(null)
    setMessage(null)
    try {
      const issue = await apiFetch<GitHubIssue>("/api/github/issues", {
        method: "POST",
        body: JSON.stringify({
          repo: selectedRepo,
          title,
          body
        })
      })
      setIssues((current) => [issue, ...current])
      setTitle("")
      setBody("")
      setMessage(`Created GitHub issue #${issue.number} in ${selectedRepo}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Issue creation failed")
    } finally {
      setIsCreating(false)
    }
  }

  const closeIssue = async (issue: GitHubIssue) => {
    const repo = repos.find((item) => issue.url.includes(`/${item.fullName}/`))?.fullName ?? selectedRepo
    if (!repo) return

    const updated = await apiFetch<GitHubIssue>("/api/github/issues", {
      method: "PATCH",
      body: JSON.stringify({
        repo,
        issueNumber: issue.number,
        state: issue.state === "open" ? "closed" : "open"
      })
    })

    setIssues((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[#a3b1c6]/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-[#2d3436]">Governance Workbench</h1>
          <p className="text-[#4a5568] text-sm">
            Create real GitHub issues, track proposal work, and show DAO-ready execution from one dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="industrial-card p-6 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold mb-3">Tracked Issues</div>
          <div className="font-mono text-4xl font-bold text-[#2d3436]">{issues.length}</div>
          <div className="flex items-center gap-2 mt-4 text-[9px] text-[#4a5568] uppercase font-mono tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a3b1c6]" /> GitHub live
          </div>
        </div>

        <div className="industrial-card p-6 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold mb-3">Open</div>
          <div className="font-mono text-4xl font-bold text-green-600">{issues.filter((issue) => issue.state === "open").length}</div>
          <div className="flex items-center gap-2 mt-4 text-[9px] text-[#4a5568] uppercase font-mono tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a3b1c6]" /> Actionable
          </div>
        </div>

        <div className="industrial-card p-6 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-widest text-[#4a5568] font-bold mb-3">Closed</div>
          <div className="font-mono text-4xl font-bold text-[#ff4757]">{issues.filter((issue) => issue.state === "closed").length}</div>
          <div className="flex items-center gap-2 mt-4 text-[9px] text-[#4a5568] uppercase font-mono tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-[#a3b1c6]" /> Completed
          </div>
        </div>

        <div className="industrial-card p-6 flex flex-col justify-between relative border border-[#ff4757]/20">
          <div className="text-[10px] uppercase tracking-widest text-[#ff4757] font-bold mb-3">Repositories</div>
          <div className="font-mono text-4xl font-bold text-[#2d3436]">{repos.length}</div>
          <button onClick={() => void loadGitHubWork()} className="industrial-button industrial-button-secondary py-2 px-4 text-[10px] mt-4 shadow-sm w-max hover:bg-[#d1d9e6]">
            REFRESH
          </button>
        </div>
      </div>

      <div className="industrial-card p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="font-bold tracking-tight text-xl mb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#ff4757]" /> Create GitHub Issue
          </h2>
          <p className="text-sm text-[#4a5568] leading-relaxed mb-5">
            This creates a real issue in the selected GitHub repository using your OAuth permission.
          </p>
          <select value={selectedRepo} onChange={(event) => setSelectedRepo(event.target.value)} className="industrial-input w-full h-12 mb-4">
            {repos.map((repo) => (
              <option key={repo.id} value={repo.fullName}>
                {repo.fullName}
              </option>
            ))}
          </select>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Issue title" className="industrial-input w-full h-12 mb-4" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Issue body / DAO task details" className="industrial-input w-full min-h-32 p-4 mb-4" />
          <button onClick={createIssue} disabled={isCreating || repos.length === 0} className="industrial-button industrial-button-primary w-full h-12 flex justify-center items-center gap-2 disabled:opacity-50">
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            CREATE ISSUE
          </button>
          {message && <p className="text-xs font-mono text-green-700 mt-4">{message}</p>}
          {error && <p className="text-xs font-mono text-[#ff4757] mt-4">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-bold tracking-tight text-xl mb-4">Demo DAO Proposals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {DEMO_PROPOSALS.map((proposal) => (
              <div key={proposal.name} className="bg-[#e0e5ec] rounded-lg border border-[#a3b1c6]/30 shadow-[var(--shadow-card)] p-5">
                <div className="font-bold text-sm mb-3">{proposal.name}</div>
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase mb-4 ${proposal.status === "Successful" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                  {proposal.status}
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="text-green-600">FOR {proposal.for.toLocaleString()}</div>
                  <div className="text-[#ff4757]">AGAINST {proposal.against.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="industrial-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568]" />
          <input
            type="text"
            placeholder="Search GitHub issues..."
            className="industrial-input w-full pl-12 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="h-12 px-4 bg-[#d1d9e6]/50 border border-[#a3b1c6]/30 rounded-lg flex items-center justify-between min-w-[140px] text-xs font-bold text-[#2d3436] hover:bg-[#d1d9e6] transition-colors">
          Recent <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </button>
      </div>

      <div className="industrial-card overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-4 bg-[#d1d9e6]/30 border-b border-[#a3b1c6]/30 text-[10px] font-bold tracking-widest text-[#4a5568] uppercase font-mono items-center gap-4">
          <div className="col-span-5">Issue</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-2">Labels</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-[#a3b1c6]/20">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-[#fafaf8]/50 transition-colors group gap-4 font-mono text-sm">
              <a href={issue.url} target="_blank" className="col-span-5 flex items-center gap-2 font-bold text-[#2d3436] font-sans tracking-tight hover:underline">
                <GitPullRequest className="w-4 h-4 text-[#ff4757]" />
                #{issue.number} {issue.title} <ExternalLink className="w-3 h-3 text-[#4a5568]" />
              </a>

              <div className="col-span-2">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase shadow-[var(--shadow-recessed)] ${issue.state === "open" ? "bg-green-100/80 text-green-800" : "bg-red-100/80 text-red-800"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${issue.state === "open" ? "bg-green-500" : "bg-[#ff4757]"}`} />
                  {issue.state}
                </div>
              </div>

              <div className="col-span-2 text-[#4a5568] text-xs">{new Date(issue.updatedAt).toLocaleDateString()}</div>
              <div className="col-span-2 text-[#4a5568] text-xs truncate">{issue.labels.join(", ") || "none"}</div>

              <div className="col-span-1 flex items-center justify-end gap-2">
                <button onClick={() => void closeIssue(issue)} className="w-8 h-8 rounded bg-[#e0e5ec] shadow-[var(--shadow-card)] flex items-center justify-center text-green-600 hover:-translate-y-0.5 transition-all">
                  {issue.state === "open" ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {filteredIssues.length === 0 && (
            <div className="px-6 py-10 text-center text-[#4a5568]">
              No GitHub issues loaded yet. Connect GitHub, select a repo, and create your first governance task.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
