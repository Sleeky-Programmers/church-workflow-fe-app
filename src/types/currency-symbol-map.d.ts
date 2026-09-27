// `currency-symbol-map` ships no type declarations of its own (and there is
// no @types package for it) - this covers the `/map` subpath import used to
// build the currency catalog in `@/lib/currency-catalog`.
declare module "currency-symbol-map/map" {
  const currencyToSymbolMap: Record<string, string>;
  export default currencyToSymbolMap;
}
