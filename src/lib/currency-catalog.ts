import { data as currencyCodesData } from "currency-codes";
import currencyToSymbolMap from "currency-symbol-map/map";

export interface CurrencyCatalogEntry {
  code: string;
  symbol: string;
  name: string;
}

// The full ISO 4217 currency list (~180 entries), bundled at build time from
// Currency-codes (code -> name) and currency-symbol-map (code -> symbol) so
// The "Add currency" combobox always has a complete, authoritative set of
// Options with no hand-typed code/symbol/name to get wrong. A currency with
// No mapped symbol (a handful of obscure ones) falls back to its own code.
export const CURRENCY_CATALOG: CurrencyCatalogEntry[] = currencyCodesData
  .map((entry) => {
    return {
      code: entry.code,
      name: entry.currency,
      symbol: currencyToSymbolMap[entry.code] || entry.code,
    };
  })
  .sort((a, b) => {
    return a.code.localeCompare(b.code);
  });

export const CURRENCY_CATALOG_BY_CODE: Record<string, CurrencyCatalogEntry> =
  Object.fromEntries(
    CURRENCY_CATALOG.map((entry) => {
      return [entry.code, entry];
    }),
  );
