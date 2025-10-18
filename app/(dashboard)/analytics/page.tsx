import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | TradeTracker",
};

const filters = [
  "Account",
  "Instrument",
  "Strategy tag",
  "Session",
  "Weekday",
  "Date range",
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Analytics workspace</h1>
        <p className="text-sm text-foreground/70">
          Cross-account insights and visualizations. Replace placeholder cards
          with dynamic charts once the analytics API is in place.
        </p>
      </header>

      <section className="flex flex-wrap gap-3 rounded-2xl border border-foreground/10 bg-background p-5 shadow-sm shadow-foreground/5">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="rounded-full border border-foreground/20 px-4 py-2 text-xs font-medium uppercase tracking-wide text-foreground/70 transition hover:border-foreground/40 hover:text-foreground"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="grid gap-6 rounded-2xl border border-dashed border-foreground/20 bg-background/40 p-6 text-sm text-foreground/60">
        <p>
          Analytics endpoints should aggregate trade metrics per grouping and
          return time-series data for equity and drawdown. Connect this view to{" "}
          <code className="rounded bg-foreground/10 px-1">
            /api/analytics/equity
          </code>{" "}
          and{" "}
          <code className="rounded bg-foreground/10 px-1">
            /api/analytics/distribution
          </code>{" "}
          once implemented.
        </p>
        <p>
          Highlight PnL distribution, risk-reward histogram, and performance by
          symbol/setup. Add saved filters and export buttons here.
        </p>
      </section>
    </div>
  );
}
