const LOCALE = 'en-US';

const STYLES: Record<string, Intl.DateTimeFormatOptions> = {
  short: { year: 'numeric', month: 'short' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
};

export type DateStyle = keyof typeof STYLES;

export function formatDate(date: Date, style: DateStyle = 'medium'): string {
  return new Intl.DateTimeFormat(LOCALE, STYLES[style]).format(date);
}
