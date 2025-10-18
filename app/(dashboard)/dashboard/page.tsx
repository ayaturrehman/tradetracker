import { Fragment } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";

import { AccountSwitcher } from "./account-switcher";
import {
  buildMonthCalendar,
  getAdjacentMonths,
  parseMonthParam,
} from "@/lib/analytics/calendar";
import { CalendarGrid } from "./calendar-grid";
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
  const monthDate = parseMonthParam(monthParam) ?? new Date();
  const monthStartLabel = format(monthDate, "MMMM yyyy");

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

  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const monthTradesDetailed = detailedTrades.filter((trade) => {
    const reference = trade.closedAt ?? trade.openedAt;
    return reference >= monthStart && reference <= monthEnd;
  });

  const calendarWeeks = buildMonthCalendar(monthTradesDetailed, monthDate);

  const recentTrades = trades
    .filter((trade) => {
      const reference = trade.closedAt ?? trade.openedAt;
      return reference >= monthStart && reference <= monthEnd;
    })
    .sort((a, b) => {
      const aDate = (a.closedAt ?? a.openedAt).getTime();
      const bDate = (b.closedAt ?? b.openedAt).getTime();
      return bDate - aDate;
    })
    .slice(0, 15);

  const { all, last30 } = calculateOverviewMetrics(
    normalizedTrades.map(({ profitLoss, openedAt, closedAt, rMultiple }) => ({
      profitLoss,
      openedAt,
      closedAt,
      rMultiple,
    })),
  );

  const kpis = [
    {
      label: "Net P&L (30d)",
      value: formatCurrencyMaybe(safeNumber(last30.netPnl)),
      detail: `Lifetime: ${formatCurrencyMaybe(safeNumber(all.netPnl))}`,
    },
    {
      label: "Win rate (30d)",
      value: formatPercent(safeNumber(last30.winRate)),
      detail: `Lifetime: ${formatPercent(safeNumber(all.winRate))}`,
    },
    {
      label: "Profit factor (30d)",
      value: formatRatio(safeNumber(last30.profitFactor)),
      detail: `Lifetime: ${formatRatio(safeNumber(all.profitFactor))}`,
    },
    {
      label: "Max drawdown (lifetime)",
      value: formatCurrencyMaybe(safeNumber(-all.maxDrawdown)),
      detail: `${all.tradeCount} trades`,
    },
  ];

  const { previous, next } = getAdjacentMonths(monthDate);

  const buildMonthParam = (date: Date) => format(date, "yyyy-MM");

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
                  month: buildMonthParam(previous),
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
                  month: buildMonthParam(next),
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

      <section className="grid gap-4 lg:grid-cols-[2.2fr_1fr]">
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
          <h2 className="text-lg font-semibold">Quick stats</h2>
          <ul className="mt-4 space-y-3 text-sm text-foreground/70">
            <li>
              Total trades:{" "}
              <span className="font-semibold">{all.tradeCount}</span>
            </li>
            <li>
              Winning trades:{" "}
              <span className="font-semibold">{all.winningTrades}</span>
            </li>
            <li>
              Losing trades:{" "}
              <span className="font-semibold">{all.losingTrades}</span>
            </li>
            <li>
              Lifetime drawdown:{" "}
              <span className="font-semibold">
                {formatCurrencyMaybe(safeNumber(-all.maxDrawdown))}
              </span>
            </li>
          </ul>
          <p className="mt-6 text-xs text-foreground/50">
            Need more detail? Use the Analytics view to slice by symbol, session, and
            strategy tags.
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
          <h2 className="text-lg font-semibold">Trade distribution overview</h2>
          <p className="mt-2 text-sm text-foreground/60">
            {last30.tradeCount > 0 ? (
              <>
                Last 30 days captured {last30.tradeCount} trades with {last30.winningTrades}{" "}
                wins and {last30.losingTrades} losses.
              </>
            ) : (
              <>No trades recorded in the last 30 days for this selection.</>
            )}
          </p>
          <div className="mt-6 space-y-2 text-sm text-foreground/70">
            <p>
              Lifetime average trade:{" "}
              <span className="font-semibold">
                {formatCurrencyMaybe(safeNumber(all.averageTrade))}
              </span>
            </p>
            <p>
              Largest win / loss:{" "}
              <span className="font-semibold">
                {formatCurrencyMaybe(safeNumber(all.largestWin))} /{" "}
                {formatCurrencyMaybe(safeNumber(all.largestLoss))}
              </span>
            </p>
            <p>
              Average R multiple:{" "}
              <span className="font-semibold">
                {formatRatio(safeNumber(all.averageRMultiple))}
              </span>
            </p>
          </div>
          <div className="mt-8 rounded-xl border border-dashed border-foreground/20 bg-foreground/5 p-4 text-xs text-foreground/60">
            Equity curve and granular analytics will render here once the charting pipeline
            is connected. Feed this component with time-series data from{" "}
            <code className="rounded bg-foreground/10 px-1">/api/analytics/equity</code>.
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
