"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

type Row = {
  id: number;
  name: string | null;
  audio_key: string | null;
  mime_type: string | null;
  duration_ms: number | null;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  transcript: string | null;
  created_at: number;
};

/** Row-level background tint + left border. Approved is visibly green;
 *  rejected dims. */
const STATUS_ROW_BG: Record<Row["status"], string> = {
  pending: "",
  approved: "bg-mint/10 hover:bg-mint/15 border-l-4 border-l-mint",
  rejected: "opacity-60",
};

/** Status pill — approved is unmistakably green. */
const STATUS_PILL: Record<Row["status"], string> = {
  pending: "bg-citrus/15 text-citrus border border-citrus/30",
  approved: "bg-mint/20 text-mint border border-mint/40",
  rejected: "bg-destructive/15 text-destructive border border-destructive/30",
};

/**
 * /compliments — admin moderation page.
 *
 * Auth: checks /api/admin/login on mount. If not logged in, shows a token
 * prompt that POSTs to /api/admin/login (which sets the cookie).
 *
 * Actions per row: play audio (if any), approve, reject, delete, download.
 * Bulk: select-all, approve-all, delete-all.
 */
export default function ComplimentsAdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [authError, setAuthError] = useState("");

  const [items, setItems] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<"all" | Row["status"]>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  // ── auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/login", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d?.data?.logged_in))
      .finally(() => setAuthChecked(true));
  }, []);

  const login = async () => {
    setAuthError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const d = await res.json();
    if (d.ok) {
      setLoggedIn(true);
      setToken("");
    } else {
      setAuthError(d.error || "invalid token");
    }
  };

  // ── data ───────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setItems(null);
    setSelected(new Set());
    const res = await fetch("/api/admin/all", { credentials: "include" });
    const d = await res.json();
    if (d.ok) setItems(d.data.items as Row[]);
    else setToast(d.error || "failed to load");
  }, []);

  useEffect(() => {
    if (loggedIn) void load();
  }, [loggedIn, load]);

  const filtered = useMemo(() => {
    if (!items) return null;
    return filter === "all" ? items : items.filter((r) => r.status === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const base = { all: 0, pending: 0, approved: 0, rejected: 0 };
    if (!items) return base;
    for (const r of items) {
      base.all += 1;
      base[r.status] += 1;
    }
    return base;
  }, [items]);

  // ── selection ──────────────────────────────────────────────────────────
  const allVisible = useMemo(() => (filtered || []).map((r) => r.id), [filtered]);
  const allSelected = allVisible.length > 0 && allVisible.every((id) => selected.has(id));
  const toggleRow = (id: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allVisible));
  };

  // ── actions ────────────────────────────────────────────────────────────
  const act = async (
    verb: "approve" | "reject" | "delete",
    ids: number[],
    reason?: string,
  ) => {
    if (!ids.length) return;
    setBusy(true);
    try {
      const body: Record<string, unknown> = ids.length === 1 ? { id: ids[0] } : { ids };
      if (verb === "reject" && reason) body.reason = reason;
      const res = await fetch(`/api/admin/${verb}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!d.ok) {
        setToast(d.error || `${verb} failed`);
        return;
      }
      setToast(`${verb}d ${ids.length} compliment${ids.length === 1 ? "" : "s"}`);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const approveBulk = () => act("approve", Array.from(selected));
  const deleteBulk = async () => {
    if (!selected.size) return;
    if (!confirm(`Permanently delete ${selected.size} compliment(s)? This cannot be undone.`)) return;
    await act("delete", Array.from(selected));
  };

  const downloadJson = () => {
    if (!items) return;
    const rows = selected.size ? items.filter((r) => selected.has(r.id)) : items;
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliments-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!items) return;
    const rows = selected.size ? items.filter((r) => selected.has(r.id)) : items;
    const header = ["id", "created_at", "status", "name", "audio_key", "mime_type", "duration_ms", "reject_reason"];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    };
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([r.id, new Date(r.created_at * 1000).toISOString(), r.status, r.name, r.audio_key, r.mime_type, r.duration_ms, r.reject_reason].map(esc).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAudio = (r: Row) => {
    if (!r.audio_key) return;
    const a = document.createElement("a");
    a.href = `/api/admin/audio/${r.id}`;
    a.download = `${r.id}-${r.name || "anonymous"}.webm`;
    a.click();
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // ── render ─────────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <main className="min-h-svh flex items-center justify-center p-6">
        <Skeleton className="h-8 w-48" />
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="min-h-svh flex items-center justify-center p-6">
        <Card className="w-full max-w-sm bg-card/70 border-border/40">
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="font-display text-3xl text-citrus leading-none">HOTLINE</h1>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">admin / moderation</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="token" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Admin token
              </Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                autoComplete="current-password"
                autoFocus
              />
            </div>
            {authError && <p className="text-destructive text-sm">{authError}</p>}
            <Button onClick={login} className="w-full rounded-full" disabled={!token}>
              Unlock
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-svh p-6 md:p-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <h1 className="font-display text-4xl text-citrus leading-none">HOTLINE / MOD</h1>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">
              {items ? `${items.length} compliment${items.length === 1 ? "" : "s"} in database` : "loading…"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={busy}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCsv} disabled={!items?.length}>
              Download CSV
            </Button>
            <Button variant="outline" size="sm" onClick={downloadJson} disabled={!items?.length}>
              Download JSON
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
              className="rounded-full"
            >
              {s} ({counts[s]})
            </Button>
          ))}
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <Card className="bg-primary/10 border-primary/40">
            <CardContent className="p-3 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm">{selected.size} selected</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={approveBulk} disabled={busy}>
                  ✓ Approve all
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteBulk} disabled={busy}>
                  🗑 Delete all
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <div className="card bg-card/40 border border-border/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm" aria-label="All compliments">
            <caption className="sr-only">All compliments across every status, filtered by the tabs above.</caption>
            <thead className="bg-background/40">
              <tr className="text-left">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible"
                    className="accent-primary h-4 w-4"
                  />
                </th>
                <th className="p-3 w-20 font-mono text-xs uppercase tracking-widest text-muted-foreground">ID</th>
                <th className="p-3 w-28 font-mono text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="p-3 w-32 font-mono text-xs uppercase tracking-widest text-muted-foreground">When</th>
                <th className="p-3 w-32 font-mono text-xs uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="p-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Audio</th>
                <th className="p-3 w-64 font-mono text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered === null && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <div className="text-muted-foreground">No compliments match this filter.</div>
                  </td>
                </tr>
              )}
              {filtered?.map((r) => (
                <tr
                  key={r.id}
                  className={`border-t border-border/20 transition-colors ${STATUS_ROW_BG[r.status] || "hover:bg-background/30"}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleRow(r.id)}
                      aria-label={`Select compliment ${r.id}`}
                      className="accent-primary h-4 w-4"
                    />
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">#{r.id}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_PILL[r.status]}`}
                    >
                      {r.status === "approved" && <span aria-hidden>✓</span>}
                      {r.status === "rejected" && <span aria-hidden>✕</span>}
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at * 1000).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-foreground/90 truncate max-w-[8rem]">{r.name || <span className="italic text-muted-foreground/60">anonymous</span>}</td>
                  <td className="p-3">
                    {r.audio_key ? (
                      <audio
                        controls
                        src={`/api/admin/audio/${r.id}`}
                        className="h-8 w-full max-w-sm"
                      />
                    ) : (
                      <span className="text-xs italic text-muted-foreground/60">(no audio)</span>
                    )}
                    {r.transcript && (
                      <div className="text-xs text-muted-foreground mt-1 italic max-w-sm">
                        “{r.transcript}”
                      </div>
                    )}
                    {r.audio_key && !r.transcript && r.status === "approved" && (
                      <button
                        type="button"
                        onClick={async () => {
                          setBusy(true);
                          try {
                            const res = await fetch("/api/admin/transcribe", {
                              method: "POST",
                              credentials: "include",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: r.id }),
                            });
                            const d = await res.json();
                            setToast(d.ok ? "transcribed" : d.error || "transcribe failed");
                            await load();
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="text-xs text-muted-foreground underline mt-1 hover:text-foreground"
                      >
                        transcribe
                      </button>
                    )}
                    {r.reject_reason && (
                      <div className="text-destructive text-xs mt-1">
                        ✕ {r.reject_reason}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      {r.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Approve compliment ${r.id}`}
                          onClick={() => act("approve", [r.id])}
                          disabled={busy}
                        >
                          <span aria-hidden>✓</span>
                        </Button>
                      )}
                      {r.audio_key && (
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Download audio for compliment ${r.id}`}
                          onClick={() => downloadAudio(r)}
                        >
                          <span aria-hidden>⬇</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Delete compliment ${r.id}`}
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Delete compliment #${r.id}?`)) act("delete", [r.id]);
                        }}
                        disabled={busy}
                      >
                        <span aria-hidden>🗑</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="text-xs text-muted-foreground/60 font-mono pt-4">
          compliment-hotline / moderation · {counts.all} total · {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
        </footer>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 text-sm shadow-md font-mono"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
