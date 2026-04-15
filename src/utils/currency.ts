export const getCurrencySymbol = (currency: string) => {
  const formatted = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);

  return formatted.replace(/\d/g, "").trim();
};

export const formatCurrency = (
  amount: number,
  currency: string,
  locale = "en-NG",
) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};
