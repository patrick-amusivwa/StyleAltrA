import { siteConfig } from "../../data/siteConfig";

export const roundDecimal = (num: number) =>
  (Math.round(num * 100) / 100).toFixed(2);

export const formatKes = (num: number) =>
  `${siteConfig.currency} ${roundDecimal(num)}`;
