import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/** NBP exchange table type — A covers major currencies, B covers minor. */
export type NbpTableType = 'A' | 'B';

/** Active tab selection including gold prices. */
export type NbpTab = 'A' | 'B' | 'gold';

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
     * Fetch historical gold prices for a given date range.
     *
     * @param params - {@link GetGoldParams} with startDate and endDate
     * @returns Array of daily gold price entries
     */
    getGoldPrices: build.query<NbpGoldPrice[], GetGoldParams>({
      query: ({ startDate, endDate }) =>
        `cenyzlota/${startDate}/${endDate}/?format=json`,
    }),
  }),
});

export const { useGetExchangeTableQuery, useGetGoldPricesQuery } = nbpApi;
