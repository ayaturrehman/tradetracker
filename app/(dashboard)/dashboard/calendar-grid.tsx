"use client";

import { Fragment, useMemo, useState } from "react";
import { format } from "date-fns";

import { CalendarTrade, CalendarWeek } from "@/lib/analytics/calendar";
import { cn, formatCurrency } from "@/lib/utils";

type CalendarGridProps = {
  weeks: CalendarWeek[];
};

type SelectedDay = {
  date: Date;
  trades: CalendarTrade[];
  netPnl: number;
  tradeCount: number;
};

const formatCurrencyMaybe = (value: number | null) =>
  value === null ? "—" : formatCurrency(value);

const safeNumber = (value: number) =>
  Number.isNaN(value) || !Number.isFinite(value) ? null : value;

export function CalendarGrid({ weeks }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);

  const totals = useMemo(
    () =>
      weeks.reduce(
        (acc, week) => {
          acc.net += week.summary.netPnl;
          acc.trades += week.summary.tradeCount;
          return acc;
        },
        { net: 0, trades: 0 },
      ),
    [weeks],
  );

  return (
    <>
      <div className="grid grid-cols-8 gap-2 text-xs">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Total"].map((day) => (
          <span
            key={day}
            className="px-2 py-1 text-center font-semibold text-foreground/60"
          >
            {day}
          </span>
        ))}

        {weeks.map((week, index) => (
          <Fragment key={`week-${index}`}>
            {week.days.map((day) => {
              const trend =
                day.netPnl === 0
                  ? "neutral"
                  : day.netPnl > 0
                    ? "positive"
                    : "negative";
              const tileClass = cn(
                "relative rounded-2xl border px-2 py-3 text-center transition",
                day.isCurrentMonth ? "" : "opacity-50",
                trend === "positive" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                trend === "negative" && "border-rose-200 bg-rose-50 text-rose-700",
                trend === "neutral" && "border-foreground/10 bg-foreground/5 text-foreground/60",
                day.tradeCount > 0 && "cursor-pointer hover:border-foreground/40",
              );

              return (
                <button
                  key={day.date.toISOString()}
                  type="button"
                  className={tileClass}
                  onClick={() => {
                    if (day.tradeCount === 0) return;
                    setSelectedDay({
                      date: day.date,
                      trades: day.trades,
                      netPnl: day.netPnl,
                      tradeCount: day.tradeCount,
                    });
                  }}
                  aria-label={
                    day.tradeCount === 0
                      ? `No trades on ${format(day.date, "PPP")}`
                      : `${day.tradeCount} trades on ${format(day.date, "PPP")}`
                  }
                >
                  <div className="text-sm font-semibold text-foreground">
                    {day.isCurrentMonth ? day.label : ""}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {day.tradeCount === 0
                      ? "—"
                      : formatCurrencyMaybe(safeNumber(day.netPnl))}
                  </div>
                  <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-foreground/50">
                    {day.tradeCount === 0 ? "0%" : `${day.winRate.toFixed(0)}%`}
                  </span>
                  <span className="absolute bottom-1 right-2 text-[10px] font-semibold text-foreground/50">
                    {day.tradeCount}T
                  </span>
                </button>
              );
            })}
            <div
              className={cn(
                "rounded-2xl border px-2 py-3 text-center",
                week.summary.netPnl > 0 && "border-emerald-200 bg-emerald-50 text-emerald-700",
                week.summary.netPnl < 0 && "border-rose-200 bg-rose-50 text-rose-700",
                week.summary.netPnl === 0 && "border-foreground/10 bg-foreground/5 text-foreground/60",
              )}
            >
              <div className="text-sm font-semibold text-foreground">Σ</div>
              <div className="mt-1 text-sm font-semibold">
                {week.summary.tradeCount === 0
                  ? "—"
                  : formatCurrencyMaybe(safeNumber(week.summary.netPnl))}
              </div>
              <div className="mt-1 flex justify-center gap-2 text-[11px] text-foreground/60">
                <span>{week.summary.tradeCount}T</span>
                <span>
                  {week.summary.tradeCount === 0
                    ? "0%"
                    : `${week.summary.winRate.toFixed(0)}%`}
                </span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      {selectedDay ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-foreground/10 bg-background shadow-lg shadow-foreground/20">
            <div className="flex items-start justify-between border-b border-foreground/10 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {format(selectedDay.date, "EEEE, MMM d yyyy")}
                </h3>
                <p className="text-sm text-foreground/60">
                  {selectedDay.tradeCount} trades — Net{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      selectedDay.netPnl > 0 && "text-emerald-500",
                      selectedDay.netPnl < 0 && "text-rose-500",
                    )}
                  >
                    {formatCurrencyMaybe(safeNumber(selectedDay.netPnl))}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-foreground/20 px-3 py-1 text-sm font-semibold text-foreground transition hover:bg-foreground/10"
                onClick={() => setSelectedDay(null)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto px-6 py-4">
              {selectedDay.trades.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  No trades recorded for this day.
                </p>
              ) : (
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-foreground/60">
                      <th className="w-[18%] py-2 pr-3">Symbol</th>
                      <th className="w-[12%] py-2 pr-3">Side</th>
                      <th className="w-[18%] py-2 pr-3">Opened</th>
                      <th className="w-[18%] py-2 pr-3">Closed</th>
                      <th className="w-[18%] py-2 pr-3 text-right">P&amp;L</th>
                      <th className="w-[16%] py-2 pr-3">Trade ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDay.trades.map((trade) => {
                      const pnl = trade.profitLoss;
                      return (
                        <tr
                          key={trade.id ?? `${trade.openedAt.toISOString()}-${trade.symbol}`}
                          className="border-t border-foreground/10 text-foreground"
                        >
                          <td className="py-2 pr-3 font-semibold">
                            {trade.symbol ?? "—"}
                          </td>
                          <td className="py-2 pr-3 uppercase text-foreground/60">
                            {trade.side ?? "—"}
                          </td>
                          <td className="py-2 pr-3 text-foreground/60">
                            {format(trade.openedAt, "dd/MM/yyyy HH:mm")}
                          </td>
                          <td className="py-2 pr-3 text-foreground/60">
                            {trade.closedAt ? format(trade.closedAt, "dd/MM/yyyy HH:mm") : "—"}
                          </td>
                          <td
                            className={cn(
                              "py-2 pr-3 text-right font-semibold",
                              pnl > 0 && "text-emerald-500",
                              pnl < 0 && "text-rose-500",
                              pnl === 0 && "text-foreground/60",
                            )}
                          >
                            {formatCurrencyMaybe(safeNumber(pnl))}
                          </td>
                          <td className="py-2 pr-3 text-foreground/60">
                            {trade.id?.slice(0, 8) ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
