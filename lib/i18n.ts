import { LocaleCode, LocalizedText } from '../types';

export const getLocalizedText = (
  value: LocalizedText | string | undefined | null,
  locale: LocaleCode,
): string => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value[locale] ?? value.en ?? value['zh-CN'] ?? '';
};

export const getLocaleDateTag = (locale: LocaleCode): string =>
  locale === 'zh-CN' ? 'zh-CN' : 'en-US';

export const formatDate = (raw: string, locale: LocaleCode): string =>
  new Date(raw).toLocaleDateString(getLocaleDateTag(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const normalizeApiBaseUrl = (raw: string | null | undefined): string =>
  (raw || '').replace(/\/$/, '');

const isWideCodePoint = (codePoint: number): boolean =>
  codePoint >= 0x1100 &&
  (
    codePoint <= 0x115f ||
    codePoint === 0x2329 ||
    codePoint === 0x232a ||
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf && codePoint !== 0x303f) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x20000 && codePoint <= 0x3fffd)
  );

export const getTerminalTextWidth = (raw: string): number =>
  Array.from(raw).reduce((total, char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    return total + (isWideCodePoint(codePoint) ? 2 : 1);
  }, 0);

export const padTerminalText = (raw: string, width: number): string =>
  raw + ' '.repeat(Math.max(0, width - getTerminalTextWidth(raw)));
