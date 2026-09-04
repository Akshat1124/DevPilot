"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderGit2,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ExternalLink,
  Lock,
  Globe,
  MessageSquare,
} from "lucide-react";

import { api, type Repository, type IndexStatus } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// ─── Status badge ────────────────────────────────────────────────────────────

function IndexStatusBadge({ status }: { status: IndexStatus }) {
  const map: Record<
    IndexStatus,
    { label: string; icon: React.ReactNode; className: string }
  > = {
    READY: {
      label: "Ready",
      icon: <CheckCircle2 className="size-3" />,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    INDEXING: {
      label: "Indexing…",
      icon: <Loader2 className="size-3 animate-spin" />,
      className:
        "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    PENDING: {
      label: "Not indexed",
      icon: <Clock className="size-3" />,
      className: "border-border bg-muted text-muted-foreground",
    },
    FAILED: {
      label: "Failed",
      icon: <XCircle className="size-3" />,
      className:
        "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
    },
  };

  const { label, icon, className } = map[status] ?? map.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Single repo card ────────────────────────────────────────────────────────

function RepoCard({ repo }: { repo: Repository }) {
  const queryClient = useQueryClient();

  const startIndex = useMutation({
    mutationFn: () => api.startIndex(repo.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repos.list() });
    },
  });

  const isIndexing = repo.indexStatus === "INDEXING";
  const isReady = repo.indexStatus === "READY";
  const canIndex =
    repo.indexStatus === "PENDING" || repo.indexStatus === "FAILED";

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <FolderGit2 className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">
                {repo.name}
              </span>
              {repo.isPrivate ? (
                <Lock className="size-3 shrink-0 text-muted-foreground" />
              ) : (
                <Globe className="size-3 shrink-0 text-muted-foreground" />
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {repo.owner}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IndexStatusBadge status={repo.indexStatus} />
          {repo.htmlUrl && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
              title="Open on GitHub"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {repo.description}
        </p>
      )}

      {/* Progress bar for INDEXING */}
      {isIndexing && repo.filesTotal > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.round(
                  (repo.filesProcessed / repo.filesTotal) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-right text-[11px] text-muted-foreground">
            {repo.filesProcessed} / {repo.filesTotal} files
          </p>
        </div>
      )}

      {/* Stats row */}
      {isReady && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary" />
              {repo.language}
            </span>
          )}
          <span>{repo.chunkCount.toLocaleString()} chunks</span>
          {repo.indexedAt && (
            <span>
              Indexed{" "}
              {new Date(repo.indexedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {isReady ? (
          <Button
            size="sm"
            className="gap-1.5"
            render={<Link href={`/dashboard/chat?repoId=${repo.id}`} />}
          >
            <MessageSquare className="size-3.5" />
            Chat
          </Button>
        ) : canIndex ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={startIndex.isPending}
            onClick={() => startIndex.mutate()}
          >
            {startIndex.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Zap className="size-3.5" />
            )}
            {startIndex.isPending ? "Starting…" : "Index repo"}
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5" disabled>
            <Loader2 className="size-3.5 animate-spin" />
            Indexing…
          </Button>
        )}

        {(isReady || repo.indexStatus === "FAILED") && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-muted-foreground"
            disabled={startIndex.isPending || isIndexing}
            onClick={() => startIndex.mutate()}
            title="Re-index"
          >
            <RefreshCw className="size-3.5" />
            Re-index
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50">
        <FolderGit2 className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No repositories found</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Make sure you have repositories on GitHub and that DevPilot has access
          to them.
        </p>
      </div>
    </div>
  );
}

// ─── RepoDashboard ────────────────────────────────────────────────────────────

export function RepoDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: repos, isLoading, isError } = useQuery({
    queryKey: queryKeys.repos.list(),
    queryFn: () => api.listRepos(false),
    refetchInterval: (query) => {
      const data = query.state.data as Repository[] | undefined;
      const hasIndexing = data?.some((r) => r.indexStatus === "INDEXING");
      return hasIndexing ? 4000 : false;
    },
  });

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await queryClient.fetchQuery({
        queryKey: queryKeys.repos.list(),
        queryFn: () => api.listRepos(true),
        staleTime: 0,
      });
    } finally {
      setRefreshing(false);
    }
  }

  // Sort: pending/indexing/failed first, ready last
  const ready = repos?.filter((r) => r.indexStatus === "READY") ?? [];
  const rest = repos?.filter((r) => r.indexStatus !== "READY") ?? [];
  const sorted = [...rest, ...ready];

  return (
    <div className="flex flex-1 flex-col">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
        <div>
          <h1 className="text-base font-semibold">Repositories</h1>
          <p className="text-xs text-muted-foreground">
            Select a repository to index and start chatting with your code.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={refreshing || isLoading}
          onClick={handleRefresh}
        >
          <RefreshCw
            className={cn("size-3.5", refreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <XCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load repositories. Try refreshing.
            </p>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        ) : !repos || repos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
