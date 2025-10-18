import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Journal | TradeTracker",
};

export default function JournalPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Trade journal</h1>
          <p className="text-sm text-foreground/70">
            Manually record trades, add notes, and attach screenshots to build a
            reviewable playbook.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          Log trade
        </Link>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Recent journal entries</h2>
          <p className="text-sm text-foreground/60">
            Once journal CRUD endpoints are wired, list recent trades here with
            tags, outcomes, and attachments. Until then, this area documents the
            data contract expected from <code className="rounded bg-foreground/10 px-1">/api/journal</code>.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-foreground/20 bg-background/40 p-6 text-sm text-foreground/60">
        <p>
          Upload handlers for screenshots or chart images will pipe files to S3.
          Persist metadata in <code className="rounded bg-foreground/10 px-1">ImportFile</code>{" "}
          and link to <code className="rounded bg-foreground/10 px-1">TradeNote</code>.
        </p>
      </section>
    </div>
  );
}
