import { subDays } from "date-fns";

type NumericTrade = {
  profitLoss: number;
  openedAt: Date;
  closedAt?: Date | null;
  rMultiple?: number | null;
};

type Metrics = {
  tradeCount: number;
  netPnl: number;
  winRate: number;
  profitFactor: number | null;
  averageRMultiple: number | null;
  averageTrade: number | null;
  largestWin: number | null;
  largestLoss: number | null;
  maxDrawdown: number;
  winningTrades: number;
  losingTrades: number;
};

type OverviewMetrics = {
  all: Metrics;
  last30: Metrics;
};

const emptyMetrics: Metrics = {
  tradeCount: 0,
  netPnl: 0,
  winRate: 0,
  profitFactor: null,
  averageRMultiple: null,
  averageTrade: null,
  largestWin: null,
  largestLoss: null,
  maxDrawdown: 0,
  winningTrades: 0,
  losingTrades: 0,
};

const toMetrics = (trades: NumericTrade[]): Metrics => {
  if (trades.length === 0) {
    return { ...emptyMetrics };
  }

  const pnlValues = trades.map((trade) => trade.profitLoss);
  const netPnl = pnlValues.reduce((acc, value) => acc + value, 0);
  const wins = pnlValues.filter((value) => value > 0).length;
  const losses = pnlValues.filter((value) => value < 0).length;
  const winRate = trades.length ? (wins / trades.length) * 100 : 0;

  const grossProfit = pnlValues.filter((value) => value > 0).reduce((acc, value) => acc + value, 0);
  const grossLoss = pnlValues.filter((value) => value < 0).reduce((acc, value) => acc + value, 0);
  const profitFactor = grossLoss !== 0 ? grossProfit / Math.abs(grossLoss) : null;

  const averageTrade = trades.length ? netPnl / trades.length : null;
  const largestWin = pnlValues.length ? Math.max(...pnlValues) : null;
  const largestLoss = pnlValues.length ? Math.min(...pnlValues) : null;

  const rMultiples = trades
    .map((trade) => (trade.rMultiple === null || trade.rMultiple === undefined ? null : trade.rMultiple))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const averageRMultiple = rMultiples.length
    ? rMultiples.reduce((acc, value) => acc + value, 0) / rMultiples.length
    : null;

  const sortedTrades = [...trades].sort((a, b) => {
    const aDate = a.closedAt ?? a.openedAt;
    const bDate = b.closedAt ?? b.openedAt;
    return aDate.getTime() - bDate.getTime();
  });

  let runningEquity = 0;
  let peakEquity = 0;
  let maxDrawdown = 0;

  for (const trade of sortedTrades) {
    runningEquity += trade.profitLoss;
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const drawdown = peakEquity - runningEquity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    tradeCount: trades.length,
    netPnl,
    winRate,
    profitFactor,
    averageRMultiple,
    averageTrade,
    largestWin,
    largestLoss,
    maxDrawdown,
    winningTrades: wins,
    losingTrades: losses,
  };
};

export const calculateOverviewMetrics = (trades: NumericTrade[]): OverviewMetrics => {
  if (trades.length === 0) {
    return {
      all: { ...emptyMetrics },
      last30: { ...emptyMetrics },
    };
  }

  const threshold = subDays(new Date(), 30);
  const last30Trades = trades.filter((trade) => {
    const referenceDate = trade.closedAt ?? trade.openedAt;
    return referenceDate >= threshold;
  });

  return {
    all: toMetrics(trades),
    last30: toMetrics(last30Trades),
  };
};
