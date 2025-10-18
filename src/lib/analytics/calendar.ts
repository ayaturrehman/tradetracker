import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  formatISO,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarTrade = {
  id?: string;
  symbol?: string;
  side?: "LONG" | "SHORT" | string;
  profitLoss: number;
  openedAt: Date;
  closedAt?: Date | null;
};

export type CalendarDay = {
  date: Date;
  label: string;
  netPnl: number;
  tradeCount: number;
  winRate: number;
  isCurrentMonth: boolean;
  winningTrades: number;
  trades: CalendarTrade[];
  winRateLabel: string;
};

export type CalendarWeek = {
  days: CalendarDay[];
  summary: {
    netPnl: number;
    tradeCount: number;
    winRate: number;
  };
};

const referenceDate = (trade: CalendarTrade) => trade.closedAt ?? trade.openedAt;

export function buildMonthCalendar(trades: CalendarTrade[], month: Date): CalendarWeek[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const calendarStart = startOfWeek(start, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(end, { weekStartsOn: 1 });

  const tradesByDay = trades.reduce<Map<string, CalendarTrade[]>>((acc, trade) => {
    const key = formatISO(referenceDate(trade), { representation: "date" });
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(trade);
    return acc;
  }, new Map());

  const dayEntries = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((day) => {
    const key = formatISO(day, { representation: "date" });
    const dayTrades = tradesByDay.get(key) ?? [];

    const netPnl = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const wins = dayTrades.filter((trade) => trade.profitLoss > 0).length;
    const winRate = dayTrades.length ? (wins / dayTrades.length) * 100 : 0;
    const winRateLabel = dayTrades.length ? `${winRate.toFixed(0)}%` : "0%";

    return {
      date: day,
      label: day.getDate().toString(),
      netPnl,
      tradeCount: dayTrades.length,
      winRate,
      isCurrentMonth: isSameMonth(day, month),
      winningTrades: wins,
      trades: dayTrades,
      winRateLabel,
    };
  });

  const weeks: CalendarWeek[] = [];

  for (let i = 0; i < dayEntries.length; i += 7) {
    const days = dayEntries.slice(i, i + 7);
    const netPnl = days.reduce((sum, day) => sum + day.netPnl, 0);
    const tradeCount = days.reduce((sum, day) => sum + day.tradeCount, 0);
    const winningTrades = days.reduce((sum, day) => sum + day.winningTrades, 0);
    const winRate = tradeCount ? (winningTrades / tradeCount) * 100 : 0;

    weeks.push({
      days,
      summary: {
        netPnl,
        tradeCount,
        winRate,
      },
    });
  }

  return weeks;
}

export function getAdjacentMonths(month: Date) {
  const start = startOfMonth(month);
  const previous = addDays(start, -1);
  const next = addDays(endOfMonth(month), 1);

  return {
    previous,
    next,
  };
}

export function parseMonthParam(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const parsed = parseISO(`${value}-01`);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
