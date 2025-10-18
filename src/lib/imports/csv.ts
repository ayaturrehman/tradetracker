import { parse } from "csv-parse/sync";
import { parse as parseDate, isValid } from "date-fns";

type TradeSide = "LONG" | "SHORT";

const HEADER_ALIAS_MAP: Record<string, NormalizedKey> = {
  symbol: "symbol",
  ticker: "symbol",
  instrument: "symbol",
  market: "symbol",
  asset: "symbol",
  pair: "symbol",
  product: "symbol",

  side: "side",
  direction: "side",
  type: "side",
  "order side": "side",
  "buy/sell": "side",
  "position": "side",

  qty: "quantity",
  quantity: "quantity",
  amount: "quantity",
  size: "quantity",
  volume: "quantity",
  contracts: "quantity",
  lots: "quantity",

  "entry price": "entryPrice",
  entry: "entryPrice",
  price: "entryPrice",
  "open price": "entryPrice",
  "avg entry price": "entryPrice",
  "average entry price": "entryPrice",

  "exit price": "exitPrice",
  "close price": "exitPrice",
  "avg exit price": "exitPrice",
  "average exit price": "exitPrice",
  "closing price": "exitPrice",

  "stop loss": "stopLoss",
  stop: "stopLoss",
  "stop price": "stopLoss",

  "take profit": "takeProfit",
  target: "takeProfit",
  "target price": "takeProfit",

  fee: "fees",
  fees: "fees",
  commission: "fees",
  commissions: "fees",
  cost: "fees",
  "transaction cost": "fees",

  pnl: "profitLoss",
  "p/l": "profitLoss",
  profit: "profitLoss",
  loss: "profitLoss",
  "profit/loss": "profitLoss",
  pl: "profitLoss",
  "net profit": "profitLoss",
  "gross profit": "profitLoss",
  "realized pnl": "profitLoss",

  "entry time": "openedAtTime",
  "open time": "openedAtTime",
  "open datetime": "openedAt",
  "execution time": "openedAt",
  date: "openedAtDate",
  "trade date": "openedAtDate",
  "entry date": "openedAtDate",
  "open date": "openedAtDate",
  "entry timestamp": "openedAt",

  "exit time": "closedAtTime",
  "close time": "closedAtTime",
  "close datetime": "closedAt",
  "exit datetime": "closedAt",
  "exit date": "closedAtDate",
  "close date": "closedAtDate",
  "close timestamp": "closedAt",

  comment: "notes",
  note: "notes",
  notes: "notes",
  memo: "notes",
  remark: "notes",

  tag: "strategyTag",
  tags: "strategyTag",
  strategy: "strategyTag",
  setup: "strategyTag",

  id: "externalId",
  "trade id": "externalId",
  ticket: "externalId",
  order: "externalId",
  "order id": "externalId",
  "position id": "externalId",
};

const DATE_FORMAT_GUESSES = [
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd'T'HH:mm:ssXXX",
  "yyyy-MM-dd",
  "MM/dd/yyyy HH:mm:ss",
  "MM/dd/yyyy HH:mm",
  "MM/dd/yyyy",
  "dd/MM/yyyy HH:mm:ss",
  "dd/MM/yyyy HH:mm",
  "dd/MM/yyyy",
  "dd.MM.yyyy HH:mm:ss",
  "dd.MM.yyyy HH:mm",
  "dd.MM.yyyy",
  "yyyy/MM/dd HH:mm:ss",
  "yyyy/MM/dd HH:mm",
  "yyyy/MM/dd",
];

export type NormalizedTrade = {
  symbol: string;
  side: TradeSide;
  quantity?: number;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  fees?: number;
  profitLoss?: number;
  openedAt: Date;
  closedAt?: Date;
  notes?: string;
  strategyTag?: string;
  externalId?: string;
  raw: Record<string, string>;
};

export type CsvParserOptions = {
  delimiter?: string;
  timezone?: string;
  decimalSeparator?: "." | ",";
  previewLimit?: number;
};

export type CsvParserResult = {
  trades: NormalizedTrade[];
  skipped: Array<{ row: number; reason: string }>;
  headerMapping: Record<string, NormalizedKey | null>;
  unknownHeaders: string[];
  warnings: string[];
};

type NormalizedKey =
  | "symbol"
  | "side"
  | "quantity"
  | "entryPrice"
  | "exitPrice"
  | "stopLoss"
  | "takeProfit"
  | "fees"
  | "profitLoss"
  | "openedAt"
  | "openedAtTime"
  | "openedAtDate"
  | "closedAt"
  | "closedAtTime"
  | "closedAtDate"
  | "notes"
  | "strategyTag"
  | "externalId";

const normalizeHeader = (header: string) =>
  header.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

const toNumber = (value: string | null | undefined, decimalSeparator: "." | "," = ".") => {
  if (!value) return undefined;
  const cleaned = value
    .trim()
    .replace(/\s/g, "")
    .replace(/[$£€¥]/g, "")
    .replace(decimalSeparator === "," ? /\./g : /,/g, "")
    .replace(decimalSeparator === "," ? /,/g : /\./g, decimalSeparator === "," ? "." : ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toSide = (value: string | null | undefined): TradeSide | undefined => {
  if (!value) return undefined;
  const raw = value.trim().toLowerCase();
  if (["buy", "long", "bought", "call"].includes(raw)) return "LONG";
  if (["sell", "short", "sold", "put"].includes(raw)) return "SHORT";
  if (/long/.test(raw)) return "LONG";
  if (/short/.test(raw)) return "SHORT";
  if (/buy/.test(raw)) return "LONG";
  if (/sell/.test(raw)) return "SHORT";
  return undefined;
};

const toDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const directDate = new Date(trimmed);
  if (Number.isFinite(directDate.getTime())) {
    return directDate;
  }

  for (const format of DATE_FORMAT_GUESSES) {
    const parsed = parseDate(trimmed, format, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const combineDateParts = (
  explicit: Date | undefined,
  datePart: string | undefined,
  timePart: string | undefined,
) => {
  if (explicit) return explicit;
  if (!datePart && !timePart) return undefined;

  const combined = [datePart ?? "", timePart ?? ""].join(" ").trim();
  return toDate(combined || datePart || timePart);
};

export function parseTradeCsv(
  csvInput: string,
  { delimiter = ",", decimalSeparator = ".", previewLimit }: CsvParserOptions = {},
): CsvParserResult {
  const rows = parse(csvInput, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    delimiter,
    relaxColumnCount: true,
    trim: true,
  }) as Record<string, string>[];

  const headerMapping: Record<string, NormalizedKey | null> = {};
  const unknownHeaders = new Set<string>();
  const normalizedTrades: NormalizedTrade[] = [];
  const skipped: Array<{ row: number; reason: string }> = [];
  const warnings: string[] = [];
  const seenTrades = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((header) => {
      const normalized = normalizeHeader(header);
      if (!headerMapping[header]) {
        headerMapping[header] = HEADER_ALIAS_MAP[normalized] ?? null;
      }
      if (headerMapping[header] === null) {
        unknownHeaders.add(header);
      }
    });
  });

  rows.forEach((row, index) => {
    const working: Partial<NormalizedTrade> & {
      openedAtDate?: string;
      openedAtTime?: string;
      closedAtDate?: string;
      closedAtTime?: string;
    } = { raw: row };

    for (const [header, value] of Object.entries(row)) {
      const target = headerMapping[header];
      if (!target) continue;

      switch (target) {
        case "symbol":
          working.symbol = value?.trim();
          break;
        case "side":
          working.side ??= toSide(value);
          break;
        case "quantity":
          working.quantity ??= toNumber(value, decimalSeparator);
          break;
        case "entryPrice":
          working.entryPrice ??= toNumber(value, decimalSeparator);
          break;
        case "exitPrice":
          working.exitPrice ??= toNumber(value, decimalSeparator);
          break;
        case "stopLoss":
          working.stopLoss ??= toNumber(value, decimalSeparator);
          break;
        case "takeProfit":
          working.takeProfit ??= toNumber(value, decimalSeparator);
          break;
        case "fees":
          working.fees ??= toNumber(value, decimalSeparator);
          break;
        case "profitLoss":
          working.profitLoss ??= toNumber(value, decimalSeparator);
          break;
        case "openedAt":
          working.openedAt ??= toDate(value);
          break;
        case "openedAtTime":
          working.openedAtTime ??= value;
          break;
        case "openedAtDate":
          working.openedAtDate ??= value;
          break;
        case "closedAt":
          working.closedAt ??= toDate(value);
          break;
        case "closedAtTime":
          working.closedAtTime ??= value;
          break;
        case "closedAtDate":
          working.closedAtDate ??= value;
          break;
        case "notes":
          working.notes ??= value;
          break;
        case "strategyTag":
          working.strategyTag ??= value;
          break;
        case "externalId":
          working.externalId ??= value;
          break;
        default:
          break;
      }
    }

    const openedAt = combineDateParts(
      working.openedAt,
      working.openedAtDate,
      working.openedAtTime,
    );
    const closedAt = combineDateParts(
      working.closedAt,
      working.closedAtDate,
      working.closedAtTime,
    );

    if (!working.symbol || !working.side) {
      skipped.push({
        row: index + 1,
        reason: "Missing required symbol or side field.",
      });
      return;
    }

    if (!openedAt) {
      warnings.push(
        `Row ${index + 1}: Unable to determine entry/open time. Trade imported without openedAt.`,
      );
    }

    const openedAtIso = openedAt ? openedAt.toISOString() : "";
    const dedupeKey = (working.externalId ?? "")
      ? `${working.externalId}`
      : [working.symbol, working.side, openedAtIso, working.entryPrice ?? "", working.quantity ?? ""].join("|");

    if (seenTrades.has(dedupeKey)) {
      skipped.push({
        row: index + 1,
        reason: "Duplicate trade detected for this file.",
      });
      return;
    }

    seenTrades.add(dedupeKey);

    normalizedTrades.push({
      symbol: working.symbol,
      side: working.side ?? "LONG",
      quantity: working.quantity,
      entryPrice: working.entryPrice,
      exitPrice: working.exitPrice,
      stopLoss: working.stopLoss,
      takeProfit: working.takeProfit,
      fees: working.fees,
      profitLoss: working.profitLoss,
      openedAt: openedAt ?? new Date(),
      closedAt: closedAt,
      notes: working.notes,
      strategyTag: working.strategyTag,
      externalId: working.externalId,
      raw: row,
    });
  });

  const trades = typeof previewLimit === "number"
    ? normalizedTrades.slice(0, previewLimit)
    : normalizedTrades;

  return {
    trades,
    skipped,
    headerMapping,
    unknownHeaders: Array.from(unknownHeaders),
    warnings,
  };
}
