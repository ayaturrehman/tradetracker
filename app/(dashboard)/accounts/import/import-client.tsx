"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

type AccountOption = {
  id: string;
  name: string;
  broker?: string | null;
};

type PreviewTrade = {
  symbol: string;
  side: string;
  quantity?: number | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  fees?: number | null;
  profitLoss?: number | null;
  openedAt: string;
  closedAt?: string | null;
  notes?: string | null;
  strategyTag?: string | null;
  externalId?: string | null;
  source?: "CSV" | "API" | "MANUAL";
  raw: Record<string, string>;
  alreadyExists: boolean;
};

type PreviewResponse = {
  data: PreviewTrade[];
  skipped: Array<{ row: number; reason: string }>;
  headerMapping: Record<string, string | null>;
  unknownHeaders: string[];
  warnings: string[];
};

type ImportCsvClientProps = {
  accounts: AccountOption[];
};

export function ImportCsvClient({ accounts }: ImportCsvClientProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    () => accounts[0]?.id ?? "",
  );
  const [csvText, setCsvText] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [decimalSeparator, setDecimalSeparator] = useState<"." | ",">(".");
  const [previewResult, setPreviewResult] = useState<PreviewResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [queueError, setQueueError] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  }, []);

  const handlePreview = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setPreviewResult(null);
    setQueueStatus("idle");
    setQueueMessage(null);
    setQueueError(null);

    try {
      const response = await fetch("/api/imports/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csv: csvText,
          delimiter,
          decimalSeparator,
          previewLimit: 50,
          accountId: selectedAccountId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Preview failed. Check your CSV format.");
      }

      const parsed = (await response.json()) as PreviewResponse;
      setPreviewResult(parsed);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error.");
      setStatus("error");
    }
  }, [csvText, delimiter, decimalSeparator, selectedAccountId]);

  const headerMappingList = useMemo(() => {
    if (!previewResult) return [];
    return Object.entries(previewResult.headerMapping).map(([header, mappedTo]) => ({
      header,
      mappedTo: mappedTo ?? "Unmapped",
    }));
  }, [previewResult]);

  const duplicateCount = useMemo(() => {
    if (!previewResult) return 0;
    return previewResult.data.filter((trade) => trade.alreadyExists).length;
  }, [previewResult]);

  const formatJSON = (value: unknown) => JSON.stringify(value, null, 2);

  const handleQueueImport = useCallback(async () => {
    if (!previewResult) {
      setQueueError("Preview the CSV first so we know which trades to import.");
      setQueueStatus("error");
      return;
    }

    const tradesToImport = previewResult.data.filter((trade) => !trade.alreadyExists);

    if (tradesToImport.length === 0) {
      setQueueStatus("success");
      setQueueMessage("No new trades found. All rows already exist for this account.");
      return;
    }

    setQueueStatus("loading");
    setQueueError(null);
    setQueueMessage(null);

    try {
      const response = await fetch("/api/imports/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradingAccountId: selectedAccountId,
          trades: tradesToImport,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to queue import job.");
      }
      const payload = (await response.json()) as {
        inserted: number;
        skipped: number;
        duplicates: number;
      };

      setQueueStatus("success");
      setQueueMessage(
        `Import queued: ${payload.inserted} new trades saved, ${payload.duplicates} duplicates skipped.`,
      );
    } catch (error) {
      setQueueStatus("error");
      setQueueError(error instanceof Error ? error.message : "Unexpected error.");
    }
  }, [previewResult, selectedAccountId]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Import trades from CSV</h1>
        <p className="text-sm text-foreground/70">
          Select the account you want to update, then upload or paste your broker CSV export.
          We will detect headers automatically and preview the normalized trades before
          ingestion.
        </p>
        <Link
          href="/accounts"
          className="text-xs font-semibold text-foreground/60 transition hover:text-foreground"
        >
          ← Back to accounts
        </Link>
      </div>

      <section className="space-y-6 rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground/80">
            Account
            <select
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.broker ? ` · ${account.broker}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-foreground/80">
            Upload CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground/80">
            Delimiter
            <select
              value={delimiter}
              onChange={(event) => setDelimiter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab (↹)</option>
            </select>
          </label>
          <label className="text-sm font-medium text-foreground/80">
            Decimal separator
            <select
              value={decimalSeparator}
              onChange={(event) =>
                setDecimalSeparator(event.target.value === "," ? "," : ".")
              }
              className="mt-1 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-foreground focus:outline-none"
            >
              <option value=".">Dot (.)</option>
              <option value=",">Comma (,)</option>
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-foreground/80">
          Or paste CSV contents
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder="symbol,side,quantity,open date,open time,pnl&#10;ESZ4,Buy,1,2024-10-01,09:32,-125.5"
            className="mt-2 h-48 w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2 text-sm font-mono focus:border-foreground focus:outline-none"
          />
        </label>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handlePreview}
            disabled={
              !csvText.trim() || status === "loading" || selectedAccountId.length === 0
            }
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            {status === "loading" ? "Previewing..." : "Preview import"}
          </button>
          <button
            type="button"
            onClick={handleQueueImport}
            disabled={selectedAccountId.length === 0 || queueStatus === "loading"}
            className="inline-flex items-center justify-center rounded-full border border-foreground/40 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5 disabled:opacity-60"
          >
            {queueStatus === "loading" ? "Queuing..." : "Queue import job"}
          </button>
          {status === "error" && errorMessage ? (
            <p className="text-sm text-red-500" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {queueStatus === "error" && queueError ? (
            <p className="text-sm text-red-500" role="alert">
              {queueError}
            </p>
          ) : null}
          {queueStatus === "success" && queueMessage ? (
            <p className="text-sm text-foreground/60" role="status">
              {queueMessage}
            </p>
          ) : null}
        </div>
      </section>

      {previewResult ? (
        <section className="space-y-6">
          <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
            <h2 className="text-lg font-semibold">Import summary</h2>
            <ul className="mt-4 space-y-2 text-sm text-foreground/70">
              <li>
                Target account:{" "}
                <span className="font-semibold">
                  {accounts.find((account) => account.id === selectedAccountId)?.name ??
                    "Unknown"}
                </span>
              </li>
              <li>
                Previewed rows:{" "}
                <span className="font-semibold">{previewResult.data.length}</span>
              </li>
              <li>
                Skipped rows:{" "}
                <span className="font-semibold">{previewResult.skipped.length}</span>
              </li>
              <li>
                Unknown headers:{" "}
                <span className="font-semibold">
                  {previewResult.unknownHeaders.length}
                </span>
              </li>
              <li>
                Warnings:{" "}
                <span className="font-semibold">
                  {previewResult.warnings.length}
                </span>
              </li>
              <li>
                Already existing trades:{" "}
                <span className="font-semibold">{duplicateCount}</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
              <h3 className="text-lg font-semibold">Detected headers</h3>
              <p className="text-xs text-foreground/60">
                Mapped columns link to the internal schema. Unmapped headers require manual
                mapping later.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                {headerMappingList.map((item) => (
                  <li key={item.header} className="flex justify-between gap-3">
                    <span className="font-medium">{item.header}</span>
                    <span className="text-foreground/60">{item.mappedTo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {previewResult.warnings.length > 0 ? (
              <div className="rounded-2xl border border-yellow-400/50 bg-yellow-100/20 p-4 text-sm text-yellow-700">
                <h3 className="font-semibold">Warnings</h3>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {previewResult.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-foreground/10 bg-background p-5 text-sm text-foreground/60 shadow-sm shadow-foreground/5">
                No parser warnings. Proceed to finish the import via the background job.
              </div>
            )}
          </div>

          {previewResult.skipped.length > 0 ? (
            <div className="rounded-2xl border border-red-400/50 bg-red-100/20 p-4 text-sm text-red-700">
              <h3 className="font-semibold">Skipped rows</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {previewResult.skipped.map((skip) => (
                  <li key={`${skip.row}-${skip.reason}`}>
                    Row {skip.row}: {skip.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {previewResult.data.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
              <h3 className="text-lg font-semibold">Preview trades</h3>
              <p className="text-xs text-foreground/60">
                First {previewResult.data.length} rows normalized by the parser.
              </p>
              <pre className="overflow-x-auto rounded-xl bg-foreground/5 p-4 text-xs">
                {formatJSON(previewResult.data)}
              </pre>
              <div className="flex flex-wrap items-center gap-3 border-t border-foreground/10 pt-4">
                <span className="text-xs text-foreground/60">
                  Review the normalized payload above before final ingestion.
                </span>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-dashed border-foreground/20 bg-background/60 p-6 text-sm text-foreground/60">
        <p>
          After reviewing the preview, upload the file to storage and call{" "}
          <code className="rounded bg-foreground/10 px-1">POST /api/imports</code> with the
          storage key, <code className="rounded bg-foreground/10 px-1">tradingAccountId</code>, and metadata. A background worker should ingest
          the parsed trades and update the sync log status.
        </p>
      </section>
    </div>
  );
}
