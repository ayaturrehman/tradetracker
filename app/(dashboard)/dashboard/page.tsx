import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";

import { AccountSwitcher } from "./account-switcher";
import { CalendarGrid } from "./calendar-grid";
import { buildMonthCalendar, parseMonthParam } from "@/lib/analytics/calendar";
import { calculateOverviewMetrics } from "@/lib/analytics/metrics";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | TradeTracker",
};

type DashboardOverviewPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const safeNumber = (value: number | null) =>
  value === null || Number.isNaN(value) || !Number.isFinite(value) ? null : value;

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(1)}%`;

const formatRatio = (value: number | null) =>
  value === null ? "—" : value.toFixed(2);

const formatCurrencyMaybe = (value: number | null) =>
  value === null ? "—" : formatCurrency(value);

export default async function DashboardOverviewPage({
  searchParams,
}: DashboardOverviewPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const accounts = await prisma.tradingAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  const selectedAccountIdParam =
    typeof searchParams?.accountId === "string" ? searchParams?.accountId : null;

  const selectedAccountId =
    selectedAccountIdParam &&
    accounts.some((account) => account.id === selectedAccountIdParam)
      ? selectedAccountIdParam
      : null;

  const monthParam = typeof searchParams?.month === "string" ? searchParams.month : null;
  const monthDate =
    parseMonthParam(monthParam) ??
    new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const currentYear = monthDate.getFullYear();
  const currentMonthIndex = monthDate.getMonth();

  const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
  const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
  const nextMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;

  const previousMonthParam = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, "0")}`;
  const monthLabelFullFormatter = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  });
  const monthLabelShortFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  });

  const displayedMonthDate = new Date(currentYear, currentMonthIndex, 1);

  const monthStartLabel = monthLabelFullFormatter.format(displayedMonthDate);

  const tradeFilter: Parameters<typeof prisma.trade.findMany>[0] = {
    where: {
      userId: user.id,
      ...(selectedAccountId ? { tradingAccountId: selectedAccountId } : {}),
    },
    orderBy: {
      openedAt: "asc",
    },
  };

  const trades = await prisma.trade.findMany(tradeFilter);

  const detailedTrades = trades.map((trade) => ({
    id: trade.id,
    symbol: trade.symbol,
    side: trade.side,
    profitLoss: Number(trade.profitLoss ?? 0),
    openedAt: trade.openedAt,
    closedAt: trade.closedAt,
  }));

  const normalizedTrades = trades.map((trade) => ({
    profitLoss: Number(trade.profitLoss ?? 0),
    openedAt: trade.openedAt,
    closedAt: trade.closedAt,
    rMultiple: trade.rMultiple ? Number(trade.rMultiple) : null,
  }));

  const monthStartMs = new Date(currentYear, currentMonthIndex, 1).getTime();
  const monthEndMs = new Date(currentYear, currentMonthIndex + 1, 0, 23, 59, 59, 999).getTime();

  const monthTradesDetailed = detailedTrades.filter((trade) => {
    const reference = trade.closedAt ?? trade.openedAt;
    const ms = reference.getTime();
    return ms >= monthStartMs && ms <= monthEndMs;
  });

  // removed verbose debug logging

  const calendarWeeks = buildMonthCalendar(monthTradesDetailed, displayedMonthDate);

  const recentTrades = trades
    .filter((trade) => {
      const reference = trade.closedAt ?? trade.openedAt;
      const ms = reference.getTime();
      return ms >= monthStartMs && ms <= monthEndMs;
    })
    .sort((a, b) => {
      const aDate = (a.closedAt ?? a.openedAt).getTime();
      const bDate = (b.closedAt ?? b.openedAt).getTime();
      return bDate - aDate;
    })
    .slice(0, 15);

  const monthNormalizedTrades = monthTradesDetailed.map((trade) => ({
    profitLoss: trade.profitLoss,
    openedAt: trade.openedAt,
    closedAt: trade.closedAt,
    rMultiple: trade.rMultiple ? Number(trade.rMultiple) : null,
  }));

  const lifetimeMetrics = calculateOverviewMetrics(normalizedTrades);
  const lifetimeAll = lifetimeMetrics.all;

  const monthMetrics = calculateOverviewMetrics(monthNormalizedTrades);
  const monthAll = monthMetrics.all;
  const month30 = monthMetrics.last30;

  const kpis = [
    {
      label: `Net P&L (${monthLabelShortFormatter.format(displayedMonthDate)})`,
      value: formatCurrencyMaybe(safeNumber(monthAll.netPnl)),
      detail: `Last 30 sessions: ${formatCurrencyMaybe(safeNumber(month30.netPnl))}`,
    },
    {
      label: "Win rate (month)",
      value: formatPercent(safeNumber(monthAll.winRate)),
      detail: `30-day view: ${formatPercent(safeNumber(month30.winRate))}`,
    },
    {
      label: "Profit factor (month)",
      value: formatRatio(safeNumber(monthAll.profitFactor)),
      detail: `30-day view: ${formatRatio(safeNumber(month30.profitFactor))}`,
    },
    {
      label: "Max drawdown (month)",
      value: formatCurrencyMaybe(safeNumber(-monthAll.maxDrawdown)),
      detail: `${monthAll.tradeCount} trades`,
    },
  ];

  const monthTotals = monthTradesDetailed.reduce(
    (acc, trade) => {
      const pnl = trade.profitLoss;
      acc.net += pnl;
      if (pnl > 0) acc.cash += pnl;
      return acc;
    },
    { net: 0, cash: 0 },
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Performance overview</h1>
          <p className="text-sm text-foreground/70">
            High-level metrics summarised for{" "}
            {selectedAccountId
              ? accounts.find((account) => account.id === selectedAccountId)?.name ??
                "this account"
              : "all accounts"}
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-foreground/20 px-3 py-1.5 text-sm text-foreground/70">
            <Link
              href={{
                pathname: "/dashboard",
                query: {
                  ...(selectedAccountId ? { accountId: selectedAccountId } : {}),
                  month: previousMonthParam,
                },
              }}
              className="rounded-full px-2 py-1 text-xs font-semibold text-foreground/70 transition hover:text-foreground"
            >
              ← Prev
            </Link>
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {monthStartLabel}
            </span>
            <Link
              href={{
                pathname: "/dashboard",
                query: {
                  ...(selectedAccountId ? { accountId: selectedAccountId } : {}),
                  month: nextMonthParam,
                },
              }}
              className="rounded-full px-2 py-1 text-xs font-semibold text-foreground/70 transition hover:text-foreground"
            >
              Next →
            </Link>
          </div>
          {accounts.length > 0 ? (
            <AccountSwitcher
              accounts={accounts}
              selectedAccountId={selectedAccountId}
            />
          ) : null}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-foreground/10 bg-background p-4 shadow-sm shadow-foreground/5"
          >
            <p className="text-xs uppercase tracking-wide text-foreground/60">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
            <p className="text-xs text-foreground/50">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/70">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">{monthStartLabel}</h2>
              <div className="flex gap-4 text-xs">
                <span>
                  Trade net:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      monthTotals.net > 0 && "text-emerald-500",
                      monthTotals.net < 0 && "text-rose-500",
                    )}
                  >
                    {formatCurrencyMaybe(safeNumber(monthTotals.net))}
                  </span>
                </span>
                <span>
                  Cash:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      monthTotals.cash > 0 && "text-emerald-500",
                      monthTotals.cash < 0 && "text-rose-500",
                    )}
                  >
                    {formatCurrencyMaybe(safeNumber(monthTotals.cash))}
                  </span>
                </span>
              </div>
            </div>
            <div className="text-xs text-foreground/50">
              {monthTradesDetailed.length} trades logged this month
            </div>
          </div>

          <CalendarGrid weeks={calendarWeeks} />
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
          <h2 className="text-lg font-semibold">Quick stats (month)</h2>
          <ul className="mt-4 space-y-3 text-sm text-foreground/70">
            <li>
              Total trades:{" "}
              <span className="font-semibold">{monthAll.tradeCount}</span>
            </li>
            <li>
              Winning trades:{" "}
              <span className="font-semibold">{monthAll.winningTrades}</span>
            </li>
            <li>
              Losing trades:{" "}
              <span className="font-semibold">{monthAll.losingTrades}</span>
            </li>
            <li>
              Monthly drawdown:{" "}
              <span className="font-semibold">
                {formatCurrencyMaybe(safeNumber(-monthAll.maxDrawdown))}
              </span>
            </li>
          </ul>
          <p className="mt-6 text-xs text-foreground/50">
            Lifetime reference: {lifetimeAll.tradeCount} trades, drawdown {formatCurrencyMaybe(
              safeNumber(-lifetimeAll.maxDrawdown),
            )}.
          </p>
          <div className="mt-6 space-y-2 text-sm text-foreground/60">
            <p>
              {monthTradesDetailed.length > 0
                ? "Calendar view highlights daily net results across the selected month."
                : "No trades recorded during this month yet."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
          <h2 className="text-lg font-semibold">Monthly distribution</h2>
          <p className="mt-2 text-sm text-foreground/60">
            {monthAll.tradeCount > 0 ? (
              <>
                {monthStartLabel} captured {monthAll.tradeCount} trades with {monthAll.winningTrades} wins and {monthAll.losingTrades} losses.
              </>
            ) : (
              <>No trades recorded for this month.</>
            )}
          </p>
          <div className="mt-6 space-y-2 text-sm text-foreground/70">
            <p>
              Average trade (month):{" "}
              <span className="font-semibold">
                {formatCurrencyMaybe(safeNumber(monthAll.averageTrade))}
              </span>
            </p>
            <p>
              Largest win / loss (month):{" "}
              <span className="font-semibold">
                {formatCurrencyMaybe(safeNumber(monthAll.largestWin))} / {formatCurrencyMaybe(safeNumber(monthAll.largestLoss))}
              </span>
            </p>
            <p>
              Average R multiple (month):{" "}
              <span className="font-semibold">
                {formatRatio(safeNumber(monthAll.averageRMultiple))}
              </span>
            </p>
          </div>
          <div className="mt-8 rounded-xl border border-dashed border-foreground/20 bg-foreground/5 p-4 text-xs text-foreground/60">
            Equity curve and granular analytics will render here once the charting pipeline is connected.
            Feed this component with time-series data from <code className="rounded bg-foreground/10 px-1">/api/analytics/equity</code>.
          </div>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm shadow-foreground/5">
          <h2 className="text-lg font-semibold">Recent trades (this month)</h2>
          <ul className="mt-4 space-y-3 text-sm text-foreground/70">
            {recentTrades.length === 0 ? (
              <li className="text-foreground/50">No trades yet this month.</li>
            ) : (
              recentTrades.map((trade) => {
                const reference = trade.closedAt ?? trade.openedAt;
                const pnl = Number(trade.profitLoss ?? 0);
                return (
                  <li
                    key={trade.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{trade.symbol}</span>
                      <span className="text-xs text-foreground/60">
                        {format(reference, "dd/MM/yyyy HH:mm:ss")}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        pnl > 0 && "text-emerald-500",
                        pnl < 0 && "text-rose-500",
                        pnl === 0 && "text-foreground/50",
                      )}
                    >
                      {formatCurrencyMaybe(safeNumber(pnl))}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
