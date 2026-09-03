
const formatters = new Map<string, Intl.DateTimeFormat>();
const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();

export function formatDate(
  date: string | number | Date,
  locale: string = 'ru',
  style: 'full' | 'long' | 'medium' | 'short' = 'short'
) {
  const key = `${locale};${style}`;
  if (!formatters.has(key)) formatters.set(key, new Intl.DateTimeFormat(locale, { dateStyle: style }));
  const formatter = formatters.get(key);
  const dateObject = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObject.getTime())) return '';
  return formatter!.format(dateObject);
}

export function formatRelativeDate(
  date: string | number | Date,
  locale: string = 'ru'
) {
  const dateObject = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObject.getTime())) return '';

  const now = new Date();
  const startOfDay = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffInDays = Math.round((startOfDay.getTime() - startOfToday.getTime()) / 86400000);

  if (diffInDays <= 0 && diffInDays >= -1) {
    if (!relativeFormatters.has(locale)) relativeFormatters.set(locale, new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }));
    const formatter = relativeFormatters.get(locale);
    return formatter!.format(diffInDays, 'day');
  }

  if (dateObject.getFullYear() === now.getFullYear()) {
    const key = `${locale};long-no-year`;
    if (!formatters.has(key)) formatters.set(key, new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }));
    const formatter = formatters.get(key);
    return formatter!.format(dateObject);
  }

  const key = `${locale};long`;
  if (!formatters.has(key)) formatters.set(key, new Intl.DateTimeFormat(locale, { dateStyle: 'long' }));
  const formatter = formatters.get(key);
  return formatter!.format(dateObject);
}
