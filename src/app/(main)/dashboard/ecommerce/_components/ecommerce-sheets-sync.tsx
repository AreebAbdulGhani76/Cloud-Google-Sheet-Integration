"use client";

import { useState } from "react";

import { ExternalLink, RefreshCw, Sheet } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EcommerceSheetsSyncProps {
  onSynced?: () => void;
}

export function EcommerceSheetsSync({ onSynced }: EcommerceSheetsSyncProps) {
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    try {
      setSyncing(true);
      const res = await fetch("/api/retail", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success("Google Sheets Synced", {
          description: `Retrieved ${data.rowsFetched} live rows from sheet tab.`,
        });
        if (onSynced) onSynced();
      } else {
        toast.error("Sync Failed", {
          description: data.error || "Unable to sync with Google Sheet.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger sync request.";
      toast.error("Connection Error", {
        description: msg,
      });
    } finally {
      setSyncing(false);
    }
  }

  const sheetUrl =
    "https://docs.google.com/spreadsheets/d/1q5CpoLUiRJJxgxCJA9hzqa10pan2-eT_0mj2ST5pgrI/edit?gid=1907577857#gid=1907577857";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1.5 py-1 px-2.5 h-8 font-medium"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Google Sheets Live
      </Badge>

      <a
        href={sheetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 h-8 rounded-md border bg-background"
      >
        <Sheet className="size-3.5 text-emerald-600" />
        <span>View Sheet</span>
        <ExternalLink className="size-3 opacity-70" />
      </a>

      <Button
        size="sm"
        onClick={handleSync}
        disabled={syncing}
        className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
      >
        <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync Sheet"}
      </Button>
    </div>
  );
}
