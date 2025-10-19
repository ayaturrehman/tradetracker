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

const DAY_MS = 24 * 60 * 60 * 1000;

const referenceDate = (trade: CalendarTrade) => trade.closedAt ?? trade.openedAt;

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const startOfWeek = (date: Date) => {
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = midnight.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  midnight.setDate(midnight.getDate() - diff);
  return midnight;
};

const endOfWeek = (date: Date) => {
  const start = startOfWeek(date);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 6);
  return end;
};

export function buildMonthCalendar(trades: CalendarTrade[], month: Date): CalendarWeek[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const tradesByDay = trades.reduce<Map<string, CalendarTrade[]>>((acc, trade) => {
    const key = toDayKey(referenceDate(trade));
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(trade);
    return acc;
  }, new Map());

  const dayEntries: CalendarDay[] = [];
  for (
    let ts = calendarStart.getTime();
    ts <= calendarEnd.getTime();
    ts += DAY_MS
  ) {
    const current = new Date(ts);
    const key = toDayKey(current);
    const dayTrades = tradesByDay.get(key) ?? [];

    const netPnl = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const wins = dayTrades.filter((trade) => trade.profitLoss > 0).length;
    const winRate = dayTrades.length ? (wins / dayTrades.length) * 100 : 0;
    const winRateLabel = dayTrades.length ? `${winRate.toFixed(0)}%` : "0%";

    dayEntries.push({
      date: current,
      label: current.getDate().toString(),
      netPnl,
      tradeCount: dayTrades.length,
      winRate,
      isCurrentMonth:
        current.getFullYear() === monthStart.getFullYear() &&
        current.getMonth() === monthStart.getMonth(),
      winningTrades: wins,
      trades: dayTrades,
      winRateLabel,
    });
  }

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

export function parseMonthParam(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(-?\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return null;
  }
  if (monthIndex < 0 || monthIndex > 11) {
    return null;
  }
  return new Date(year, monthIndex, 1);
}
