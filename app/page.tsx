'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  ChartSpline,
  Cloud,
  FileSpreadsheet,
  Layers3,
  LineChart,
  PieChart,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";

const navigation = [
  { label: "Home", href: "#hero" },
  { label: "Connectors", href: "#connectors" },
  { label: "CSV Imports", href: "#uploads" },
  { label: "Reporting", href: "#reporting" },
  { label: "Automation", href: "#automation" },
  { label: "Pricing", href: "/pricing" },
];

const heroHighlights = [
  { label: "Broker connectors live", value: "3" },
  { label: "CSV layouts parsed", value: "40+" },
  { label: "Insights refresh", value: "Real-time" },
];

const brokerConnectors = [
  {
    name: "Interactive Brokers",
    status: "LIVE",
    description:
      "Sync multi-account executions every five minutes with order, leg, and commission context.",
    Icon: Building2,
    points: ["Intraday fills", "FX & Futures", "Multi-account rollups"],
  },
  {
    name: "Binance Futures",
    status: "LIVE",
    description:
      "Pull perpetual and spot data including funding, realized fees, and sub-account exposure.",
    Icon: Cloud,
    points: ["USDⓈ-M & COIN-M", "Funding snapshots", "Sub-account support"],
  },
  {
    name: "TD Ameritrade",
    status: "BETA",
    description:
      "Equities and options coverage with cost attribution, corporate actions, and paper trading feeds.",
    Icon: Layers3,
    points: ["Options greeks (soon)", "Corporate actions", "Paper trading import"],
  },
];

const uploadPillars = [
  {
    title: "Drop your CSV",
    description:
      "Upload raw broker exports or spreadsheets. TradeTracker detects delimiters, encodings, and headers automatically.",
    Icon: UploadCloud,
  },
  {
    title: "Auto-map columns",
    description:
      "Alias engine matches symbol, side, price, PnL, and custom tags. Override mappings per file when brokers get creative.",
    Icon: FileSpreadsheet,
  },
  {
    title: "Validate & dedupe",
    description:
      "Preview results, flag missing data, and skip duplicates before committing. Every file gets a sync log for compliance.",
    Icon: ShieldCheck,
  },
];

const reportingHighlights = [
  {
    title: "Desk Overview",
    description:
      "Monitor net P&L, expectancy, risk per desk, and account health with real-time refresh.",
    Icon: BarChart3,
  },
  {
    title: "Strategy Attribution",
    description:
      "Tag trades by setup, session, or playbook. Slice results across desks and counterparties instantly.",
    Icon: PieChart,
  },
  {
    title: "Intraday Replay",
    description:
      "Scrub executions alongside market context, notes, and media to accelerate feedback loops.",
    Icon: LineChart,
  },
];

const automationTimeline = [
  {
    title: "Morning sync",
    time: "07:45 desk time",
    description: "Connected brokers pull overnight fills and reconcile positions before the bell.",
    Icon: Zap,
  },
  {
    title: "Midday check-in",
    time: "12:05",
    description: "Rules engine flags anomalies in sizing, slippage, and risk. Alerts route to Slack.",
    Icon: ChartSpline,
  },
  {
    title: "End-of-day report",
    time: "21:15",
    description: "CSV uploads finalize, adjustments are applied, and distribution-ready PDFs are generated.",
    Icon: CalendarCheck,
  },
];

const miniChartBars = [48, 72, 54, 88, 63, 97, 82];
const miniChartColors = [
  ["#6366F1", "#818CF8"],
  ["#22D3EE", "#38BDF8"],
  ["#8B5CF6", "#6366F1"],
  ["#F97316", "#FB7185"],
  ["#0EA5E9", "#22D3EE"],
  ["#FACC15", "#F97316"],
  ["#10B981", "#34D399"],
];

export default function MarketingHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <DecorativeBackdrop />

      <NavigationBar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-28 pt-12 sm:gap-28 sm:pb-36 sm:pt-20">
        <section id="hero" className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-9">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/70">
              <Sparkles className="h-4 w-4 stroke-[1.75]" />
              New: Broker automation for advanced desks
            </span>

            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Command your trading data from broker sync to attribution in minutes.
              </h1>
              <p className="max-w-2xl text-pretty text-lg text-foreground/75">
                TradeTracker is the control center for discretionary and systematic teams. Connect
                live brokers, ingest manual CSVs, and ship audit-ready reports without juggling
                sheets or custom scripts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                Launch free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#connectors"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/25 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/40 hover:bg-foreground/5"
              >
                Explore integrations
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-foreground/60">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-foreground/15 bg-background/70 px-4 py-3 shadow-sm shadow-foreground/5"
                >
                  <span className="text-lg font-semibold text-foreground">{item.value}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroInsightPanel />
        </section>

        <section id="connectors" className="space-y-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Plug & play broker connectors</h2>
            <p className="max-w-3xl text-base text-foreground/70">
              Launch with Interactive Brokers, Binance Futures, and TD Ameritrade. Map additional
              brokers through secure service accounts or schedule CSV drops while new APIs roll out.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {brokerConnectors.map((connector) => (
              <article
                key={connector.name}
                className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-foreground/10 bg-background/90 p-6 shadow-sm shadow-foreground/5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center gap-3">
                  <connector.Icon className="h-11 w-11 rounded-2xl border border-foreground/10 bg-foreground/10 p-2 text-foreground/80" />
                  <div>
                    <p className="text-lg font-semibold">{connector.name}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        connector.status === "LIVE"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {connector.status}
                    </span>
                  </div>
                </div>
                <p className="relative text-sm text-foreground/70">{connector.description}</p>
                <ul className="relative space-y-2 text-sm text-foreground/60">
                  {connector.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/40" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="uploads" className="grid gap-10 rounded-3xl border border-foreground/10 bg-background/85 p-8 shadow-lg shadow-foreground/10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Manual CSV imports without the friction</h2>
            <p className="text-sm text-foreground/70">
              Broker missing an API? Drop exports directly into TradeTracker. The pipeline cleans,
              maps, and confirms every row so compliance teams and quants trust the numbers.
            </p>
            <div className="space-y-3">
              {uploadPillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background/90 p-4">
                  <pillar.Icon className="mt-1 h-8 w-8 text-foreground/80" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                    <p className="text-sm text-foreground/65">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-dashed border-foreground/15 bg-background/70 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
              Upload preview
            </h3>
            <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4 text-xs text-foreground/70">
{`symbol,side,qty,entry,exit,pnl,tag
ESZ4,LONG,2,4867.25,4872.50,525.00,Opening Drive
CLZ4,SHORT,1,78.12,77.40,720.00,Inventory Fade
BTCUSDT,LONG,0.5,97850,99340,738.50,Futures Hedge`}
            </div>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Duplicates removed using account, timestamp, and entry price fingerprinting.
              </li>
              <li className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-sky-500" />
                Strategy tags, sessions, and desk metadata applied on ingest.
              </li>
              <li className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                Sync log stored with checksum for audit and reprocessing.
              </li>
            </ul>
          </div>
        </section>

        <section
          id="reporting"
          className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/90 p-8 shadow-lg shadow-foreground/10"
        >
          <ReportingBackdrop />
          <div className="relative space-y-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-semibold sm:text-4xl">Reporting that answers the “why”</h2>
              <p className="max-w-3xl text-base text-foreground/70">
                From desk-level to individual strategy attribution, TradeTracker surfaces the signals
                you need to adjust risk, sharpen entries, and communicate performance internally or to
              investors.
            </p>
          </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/85 p-6 shadow-xl shadow-foreground/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_70%)]" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center justify-between text-sm text-foreground/60">
                <span>Last 7 sessions vs. prior month</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Net +12.6%
                </span>
              </div>
                  <MiniPerformanceChart />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatCard label="Expectancy" value="+0.86R" delta="+0.18R vs. 30D" />
                    <StatCard label="Win rate" value="58.2%" delta="+3.4 pts" />
                    <StatCard label="Avg hold time" value="26m" delta="-8m vs. plan" />
                    <StatCard label="Max DD" value="-3.1%" delta="+1.2 pts" />
                  </div>
                </div>
              </div>

              <div className="relative grid gap-6">
                <div className="pointer-events-none absolute -left-20 top-6 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(132,204,22,0.18),_transparent_70%)]" />
                <div className="pointer-events-none absolute -right-16 bottom-6 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.18),_transparent_70%)]" />
                {reportingHighlights.map((item, index) => (
                  <div
                    key={item.title}
                    className="relative flex items-start gap-4 rounded-3xl border border-foreground/10 bg-background/92 p-5 shadow-sm shadow-foreground/5 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent" />
                    <item.Icon
                      className={`relative mt-1 h-10 w-10 rounded-2xl border border-foreground/15 p-2 text-foreground/80 ${
                        index % 2 === 0
                          ? "bg-gradient-to-br from-sky-500/20 via-sky-400/10 to-transparent"
                          : "bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent"
                      }`}
                    />
                    <div className="relative space-y-2">
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-foreground/65">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="automation" className="space-y-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Automation that keeps desks aligned</h2>
            <p className="max-w-3xl text-base text-foreground/70">
              Configure sync cadences, review tasks, and report delivery windows that match the
              tempo of your operation. No more emailing spreadsheets across desks.
            </p>
          </div>

          <div className="space-y-6 rounded-3xl border border-foreground/10 bg-background/85 p-8 shadow-lg shadow-foreground/10">
            {automationTimeline.map((item, index) => (
              <div
                key={item.title}
                className="grid gap-4 border-l border-dashed border-foreground/20 pl-6 sm:grid-cols-[200px_1fr] sm:gap-8 sm:border-none sm:pl-0"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-foreground/65">
                  <item.Icon className="h-5 w-5 text-foreground/70" />
                  <span>{item.time}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-foreground/65">{item.description}</p>
                </div>
                {index !== automationTimeline.length - 1 ? (
                  <div className="hidden h-full flex-col items-center pl-[11px] sm:flex">
                    <span className="h-full border-l border-dashed border-foreground/15" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/15 bg-gradient-to-br from-foreground/10 via-background to-background/95 p-10 text-center shadow-xl shadow-foreground/10">
          <div className="mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready to elevate your trading operations?
            </h2>
            <p className="text-base text-foreground/70">
              Start your 14-day trial, connect three brokers, import historic CSVs, and publish
              investor-ready reports before the next market open.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                Create my workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30 hover:bg-foreground/5"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/80 p-4 shadow-sm shadow-foreground/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-foreground/60">{delta}</p>
    </div>
  );
}

function HeroInsightPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/80 p-6 shadow-xl shadow-foreground/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_65%)]" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between text-sm text-foreground/65">
          <span>Live broker sync status</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            <Sparkles className="h-3.5 w-3.5" />
            Healthy
          </span>
        </div>
        <MiniPerformanceChart />
        <div className="grid gap-3 text-sm text-foreground/65 sm:grid-cols-2">
          {brokerConnectors.slice(0, 2).map((connector) => (
            <div key={connector.name} className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-background/90 px-3 py-2">
              <connector.Icon className="h-8 w-8 text-foreground/80" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{connector.name}</p>
                <p className="text-xs uppercase tracking-wide text-emerald-500">{connector.status}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-foreground/10 bg-background/90 px-3 py-2 text-sm">
            <p className="font-semibold text-foreground">Manual CSV ingest</p>
            <p className="text-xs text-foreground/60">3 files processed today · 0 exceptions</p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-background/90 px-3 py-2 text-sm">
            <p className="font-semibold text-foreground">Reporting queue</p>
            <p className="text-xs text-foreground/60">Daily desk report ready in 4m</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-background/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between">
        <div className="flex flex-col gap-4 md:max-w-sm">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
              TT
            </span>
            TradeTracker
          </Link>
          <p className="text-sm text-foreground/60">
            TradeTracker unifies broker feeds, manual uploads, and reporting into one control center
            for modern trading teams.
          </p>
          <div className="flex gap-3 text-xs text-foreground/50">
            <span>© {new Date().getFullYear()} TradeTracker</span>
            <span>·</span>
            <span>All rights reserved</span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <FooterColumn
            title="Product"
            links={[
              { label: "Connectors", href: "#connectors" },
              { label: "CSV Pipeline", href: "#uploads" },
              { label: "Reporting", href: "#reporting" },
              { label: "Automation", href: "#automation" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Changelog", href: "#" },
              { label: "Security", href: "#" },
              { label: "Status", href: "#" },
              { label: "Docs (soon)", href: "#" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Contact", href: "#" },
              { label: "Legal", href: "#" },
            ]}
          />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground/80">{title}</h4>
      <ul className="space-y-2 text-foreground/60">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecorativeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-[620px] w-[780px] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_70%)]" />
      <div className="absolute -left-56 top-1/3 h-[520px] w-[520px] blur-3xl bg-[radial-gradient(circle,_rgba(6,182,212,0.35),_transparent_75%)]" />
      <div className="absolute -right-60 top-[48%] h-[560px] w-[560px] blur-3xl bg-[radial-gradient(circle,_rgba(129,140,248,0.32),_transparent_75%)]" />

      <div className="absolute left-6 top-10 animate-float-slow">
        <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[18px] border border-white/5 bg-gradient-to-br from-sky-500/35 via-sky-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-sky-400/20 blur-xl" />
          <BarChart3 className="relative h-16 w-16 text-sky-100/80" />
        </div>
      </div>

      <div className="absolute right-10 top-28 animate-float-medium">
        <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[20px] border border-white/5 bg-gradient-to-br from-fuchsia-500/35 via-rose-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-rose-400/25 blur-xl" />
          <Cloud className="relative h-18 w-18 text-rose-100/80" />
        </div>
      </div>

      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 animate-float-slow">
        <div className="relative flex h-30 w-30 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-gradient-to-br from-emerald-500/35 via-teal-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/25 blur-xl" />
          <Sparkles className="relative h-14 w-14 text-emerald-100/80" />
        </div>
      </div>

      <div className="absolute left-[18%] top-[66%] hidden lg:block animate-float-medium">
        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[16px] border border-white/5 bg-gradient-to-br from-indigo-500/35 via-purple-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-indigo-400/25 blur-lg" />
          <ChartSpline className="relative h-14 w-14 text-indigo-100/75" />
        </div>
      </div>

      <div className="absolute right-[18%] top-[72%] hidden lg:block animate-float-slow">
        <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[16px] border border-white/5 bg-gradient-to-br from-amber-500/35 via-orange-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -left-10 -top-10 h-30 w-30 rounded-full bg-amber-400/25 blur-lg" />
          <Layers3 className="relative h-16 w-16 text-amber-100/75" />
        </div>
      </div>
    </div>
  );
}

function ReportingBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-6 h-64 w-[70%] -translate-x-1/2 bg-[radial-gradient(circle,_rgba(79,70,229,0.18),_transparent_75%)]" />
      <div className="absolute left-6 bottom-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.16),_transparent_75%)]" />
      <div className="absolute right-8 top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.16),_transparent_75%)]" />

      <div className="absolute left-8 top-16 animate-float-slow">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-sky-500/30 via-blue-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-sky-400/20 blur-lg" />
          <BarChart3 className="relative h-12 w-12 text-sky-100/80" />
        </div>
      </div>

      <div className="absolute right-10 top-48 animate-float-medium">
        <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/30 via-teal-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -right-6 -bottom-6 h-[5.5rem] w-[5.5rem] rounded-full bg-emerald-400/20 blur-lg" />
          <PieChart className="relative h-12 w-12 text-emerald-100/80" />
        </div>
      </div>

      <div className="absolute left-1/2 bottom-14 -translate-x-1/2 animate-float-medium">
        <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center overflow-hidden rounded-full border border-white/5 bg-gradient-to-br from-amber-500/30 via-orange-400/15 to-transparent backdrop-blur-md">
          <div className="absolute -left-5 -top-5 h-[5.5rem] w-[5.5rem] rounded-full bg-amber-400/20 blur-lg" />
          <LineChart className="relative h-12 w-12 text-amber-100/80" />
        </div>
      </div>
    </div>
  );
}

function NavigationBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    const { style } = document.body;
    const originalOverflow = style.overflow;
    if (mobileOpen) {
      style.overflow = "hidden";
    }
    return () => {
      style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={closeMobile}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
            TT
          </span>
          TradeTracker
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-foreground/70 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-semibold text-foreground/70 transition hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-foreground/20 px-4 py-2 text-sm font-semibold text-foreground md:hidden"
          onClick={toggleMobile}
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-10 bg-background/95 px-6 py-10 transition-all duration-200 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={closeMobile}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">
                TT
              </span>
              TradeTracker
            </Link>
            <button
              type="button"
              className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-semibold text-foreground"
              onClick={closeMobile}
            >
              Close
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-base font-semibold text-foreground/80">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-foreground/10 bg-background/80 px-4 py-3 transition hover:border-foreground/20 hover:text-foreground"
                onClick={closeMobile}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
              onClick={closeMobile}
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/30 hover:bg-foreground/5"
              onClick={closeMobile}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniPerformanceChart() {
  const [bars, setBars] = useState<number[]>(() => miniChartBars.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => setBars(miniChartBars), 120);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...miniChartBars);
  const paddedMax = maxValue * 1.1;
  const linePoints =
    bars.length > 1
      ? bars
          .map((value, index) => {
            const x = (index / (bars.length - 1)) * 100;
            const y = 100 - (value / paddedMax) * 90 - 5;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ")
      : "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-sm shadow-foreground/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.22),_transparent_65%)]" />
      <div className="relative flex items-end justify-between gap-2">
        {bars.map((height, index) => {
          const gradient = miniChartColors[index % miniChartColors.length];
          return (
            <div
              key={index}
              className="flex-1 rounded-t-full bg-gradient-to-t from-foreground/30 via-foreground/40 to-foreground/70 transition-all duration-700 ease-out"
              style={{ height: `${height}%`, minHeight: "60px" }}
            >
              <div
                className="h-full rounded-t-full"
                style={{
                  background: `linear-gradient(180deg, ${gradient[0]}, ${gradient[1]})`,
                }}
              />
            </div>
          );
        })}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[160px] w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chart-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>
          <polyline
            points={linePoints}
            fill="none"
            stroke="url(#chart-line)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80 transition-opacity duration-700"
          />
          {bars.map((value, index) => {
            if (!linePoints) return null;
            const x = (index / (bars.length - 1)) * 100;
            const y = 100 - (value / paddedMax) * 90 - 5;
            return (
              <circle
                key={`marker-${index}`}
                cx={x}
                cy={y}
                r={1.5}
                fill="#F8FAFC"
                stroke="#0EA5E9"
                strokeWidth="0.6"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>
      </div>
      <div className="relative mt-4 flex items-center justify-between text-xs text-foreground/60">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}
