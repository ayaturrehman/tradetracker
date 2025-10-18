import Link from "next/link";

const features = [
  {
    title: "Unified Trade Journal",
    description:
      "Import trades from every broker, tag them with strategies, and replay key moments with notes, screenshots, and risk metrics.",
  },
  {
    title: "Performance Analytics",
    description:
      "Track win rate, profit factor, drawdown, and R multiples across accounts, symbols, and sessions with exportable dashboards.",
  },
  {
    title: "Automated Sync",
    description:
      "Schedule CSV imports or connect broker APIs to keep your data fresh. Get notified the moment a sync completes.",
  },
];

export default function MarketingHome() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:py-20 lg:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/70">
            TradeTracker
          </span>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Own your trading edge with a journal built for serious market
            operators.
          </h1>

          <p className="max-w-xl text-pretty text-lg text-foreground/80">
            Connect every brokerage account, import your trade history in
            minutes, and turn raw executions into actionable insights. Spend
            less time copying spreadsheets and more time improving your playbook.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
            >
              Compare plans
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-background via-background to-foreground/5 p-8 shadow-lg shadow-foreground/5">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Live Performance Snapshot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <CardStat label="Win Rate" value="62.4%" delta="+4.1%" />
              <CardStat label="Profit Factor" value="1.87" delta="+0.24" />
              <CardStat label="Avg R:R" value="2.4" delta="+0.3" />
              <CardStat label="Max Drawdown" value="-6.8%" delta="-0.9%" />
            </div>
            <div className="rounded-2xl border border-dashed border-foreground/20 bg-background/70 p-4">
              <p className="text-sm font-medium text-foreground/80">
                “TradeTracker makes it obvious which setups keep paying. I can
                finally batch-import from Binance, IBKR, and MetaTrader without
                fixing CSVs by hand.”
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-foreground/60">
                Maya Chen · Futures & Crypto Trader
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Build a data-driven trading workflow
          </h2>
          <p className="max-w-3xl text-base text-foreground/70">
            From first import to daily performance updates, TradeTracker helps
            you stay organized and compliant while uncovering repeatable edges.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function CardStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/80 p-4">
      <p className="text-xs font-medium uppercase text-foreground/60">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="text-xs text-foreground/60">vs. last 30 sessions {delta}</p>
    </div>
  );
}
