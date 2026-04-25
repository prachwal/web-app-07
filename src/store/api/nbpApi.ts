import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** NBP exchange table type — A covers major currencies, B covers minor. */
export type NbpTableType = 'A' | 'B';

/** NBP exchange table type including buy/sell table C. */
export type NbpTableTypeABC = 'A' | 'B' | 'C';

/** Active tab selection including Table C (buy/sell) and gold prices. */
export type NbpTab = 'A' | 'B' | 'C' | 'gold';

/** Single currency exchange rate entry. */
export interface NbpRate {
  /** Full currency name (e.g. "dolar amerykański"). */
  currency: string;
  /** ISO 4217 currency code (e.g. "USD"). */
  code: string;
  /** Average (mid) exchange rate against PLN. */
  mid: number;
}

/** A single NBP exchange rate table response entry. */
export interface NbpTableEntry {
  /** Table type: A or B. */
  table: NbpTableType;
  /** Table publication number (e.g. "081/A/NBP/2024"). */
  no: string;
  /** Date the rates are effective (ISO 8601). */
  effectiveDate: string;
  /** List of currency rates in the table. */
  rates: NbpRate[];
}

/** Single gold price entry from the NBP gold price API. */
export interface NbpGoldPrice {
  /** Date of the price (ISO 8601, e.g. "2024-04-25"). */
  data: string;
  /** Gold price in PLN per gram. */
  cena: number;
}

/** Parameters for the gold prices query. */
export interface GetGoldParams {
  /** Start date in ISO 8601 format (YYYY-MM-DD). */
  startDate: string;
  /** End date in ISO 8601 format (YYYY-MM-DD). */
  endDate: string;
}

/** Single currency rate in Table C (buy/sell). */
export interface NbpRateC {
  /** Full currency name (e.g. "dolar amerykański"). */
  currency: string;
  /** ISO 4217 currency code (e.g. "USD"). */
  code: string;
  /** Buy (bid) exchange rate against PLN. */
  bid: number;
  /** Sell (ask) exchange rate against PLN. */
  ask: number;
}

/** A single NBP Table C exchange rate entry. */
export interface NbpTableEntryC {
  /** Table type: C. */
  table: 'C';
  /** Table publication number. */
  no: string;
  /** Trading date (ISO 8601). */
  tradingDate: string;
  /** Effective date (ISO 8601). */
  effectiveDate: string;
  /** List of buy/sell currency rates. */
  rates: NbpRateC[];
}

/** Single mid-rate data point in a historical series (Tables A/B). */
export interface NbpRatePoint {
  /** Table entry number. */
  no: string;
  /** Date the rate is effective (ISO 8601). */
  effectiveDate: string;
  /** Average (mid) exchange rate against PLN. */
  mid: number;
}

/** Response for a historical currency rate series query (Tables A/B). */
export interface NbpRateSeries {
  /** Table type (A or B). */
  table: NbpTableType;
  /** Full currency name. */
  currency: string;
  /** ISO 4217 currency code. */
  code: string;
  /** Array of daily rate points. */
  rates: NbpRatePoint[];
}

/** Single buy/sell rate data point in a Table C historical series. */
export interface NbpRateCPoint {
  /** Table entry number. */
  no: string;
  /** Date the rate is effective (ISO 8601). */
  effectiveDate: string;
  /** Buy (bid) rate. */
  bid: number;
  /** Sell (ask) rate. */
  ask: number;
}

/** Response for a historical currency rate series query (Table C). */
export interface NbpRateSeriesC {
  /** Table type: C. */
  table: 'C';
  /** Full currency name. */
  currency: string;
  /** ISO 4217 currency code. */
  code: string;
  /** Array of daily bid/ask rate points. */
  rates: NbpRateCPoint[];
}

/** Parameters for a currency rate series query. */
export interface GetRatesSeriesParams {
  /** Table type: A or B. */
  table: NbpTableType;
  /** ISO 4217 currency code (e.g. "USD"). */
  code: string;
  /** Start date in ISO 8601 format (YYYY-MM-DD). */
  startDate: string;
  /** End date in ISO 8601 format (YYYY-MM-DD). */
  endDate: string;
}

/** Parameters for a Table C currency rate series query. */
export interface GetRatesSeriesCParams {
  /** ISO 4217 currency code (e.g. "USD"). */
  code: string;
  /** Start date in ISO 8601 format (YYYY-MM-DD). */
  startDate: string;
  /** End date in ISO 8601 format (YYYY-MM-DD). */
  endDate: string;
}

/**
 * Returns true when the date range is valid for NBP series queries.
 * The NBP API allows a maximum of 93 days per request.
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate   - End date in YYYY-MM-DD format
 * @returns True when the range is 0–93 days inclusive
 */
export function isNbpRangeValid(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 93;
}

/**
 * RTK Query API slice for the Polish National Bank (NBP) public API.
 * Provides endpoints for exchange rate tables A & B and historical gold prices.
 *
 * @see https://api.nbp.pl/
 */
export const nbpApi = createApi({
  reducerPath: 'nbpApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.nbp.pl/api/' }),
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    /**
     * Fetch the current NBP exchange rate table (A or B).
     *
     * @param table - Table type: 'A' for major currencies, 'B' for minor
     * @returns Array of table entries (usually one for today)
     */
    getExchangeTable: build.query<NbpTableEntry[], NbpTableType>({
      query: (table) => `exchangerates/tables/${table}/?format=json`,
    }),

    /**
     * Fetch the current NBP Table C buy/sell exchange rates.
     *
     * @returns Array of Table C entries (usually one for today)
     */
    getExchangeTableC: build.query<NbpTableEntryC[], void>({
      query: () => `exchangerates/tables/C/?format=json`,
    }),

    /**
     * Fetch historical gold prices for a given date range.
     *
     * @param params - {@link GetGoldParams} with startDate and endDate
     * @returns Array of daily gold price entries
     */
    getGoldPrices: build.query<NbpGoldPrice[], GetGoldParams>({
      query: ({ startDate, endDate }) =>
        `cenyzlota/${startDate}/${endDate}/?format=json`,
    }),

    /**
     * Fetch a historical exchange rate series for a single currency (Tables A/B).
     * Maximum range: 93 days.
     *
     * @param params - {@link GetRatesSeriesParams}
     * @returns Single {@link NbpRateSeries} with daily mid rates
     */
    getRatesSeries: build.query<NbpRateSeries, GetRatesSeriesParams>({
      query: ({ table, code, startDate, endDate }) =>
        `exchangerates/rates/${table}/${code}/${startDate}/${endDate}/?format=json`,
    }),

    /**
     * Fetch a historical buy/sell exchange rate series for a single currency (Table C).
     * Maximum range: 93 days.
     *
     * @param params - {@link GetRatesSeriesCParams}
     * @returns Single {@link NbpRateSeriesC} with daily bid/ask rates
     */
    getRatesSeriesC: build.query<NbpRateSeriesC, GetRatesSeriesCParams>({
      query: ({ code, startDate, endDate }) =>
        `exchangerates/rates/C/${code}/${startDate}/${endDate}/?format=json`,
    }),
  }),
});

export const {
  useGetExchangeTableQuery,
  useGetExchangeTableCQuery,
  useGetGoldPricesQuery,
  useGetRatesSeriesQuery,
  useGetRatesSeriesCQuery,
} = nbpApi;
