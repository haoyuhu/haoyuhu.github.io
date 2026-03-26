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
