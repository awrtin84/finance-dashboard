const FA = "۰۱۲۳۴۵۶۷۸۹";

export const toFa = (value: string | number): string => String(value).replace(/\d/g, (d) => FA[Number(d)]);

export const toEn = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

export const money = (n: number): string => toFa(Math.round(n).toLocaleString("en-US").replace(/,/g, "٬"));

export const parseAmount = (value: string): number => {
  const digits = toEn(value).replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

export function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${toFa(+(n / 1e9).toFixed(1))} میلیارد`;
  if (abs >= 1e6) return `${toFa(+(n / 1e6).toFixed(1))} میلیون`;
  if (abs >= 1e3) return `${toFa(Math.round(n / 1e3))} هزار`;
  return toFa(n);
}
