import dayjs from 'dayjs';

const npr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** "Rs. 12,450" — Nepali grouping (lakh) matches how admins read amounts. */
export const formatNPR = (value: number) => `Rs. ${npr.format(value)}`;

/** Compact axis label: 950 / 1.2K / 3.4L. */
export const formatCompactNPR = (value: number) => {
  if (value >= 100000) return `${+(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${+(value / 1000).toFixed(1)}K`;
  return `${value}`;
};

export const formatNumber = (value: number) => npr.format(value);

export const formatDate = (value: string | Date) =>
  dayjs(value).format('D MMM YYYY');

export const formatDateTime = (value: string | Date) =>
  dayjs(value).format('D MMM YYYY, h:mm A');

/** Percent change vs a previous period; null when there is no baseline. */
export const percentChange = (value: number, previous: number) =>
  previous === 0 ? null : ((value - previous) / previous) * 100;
