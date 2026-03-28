import { LocaleCode, LocalizedText, PostEntry } from '../types';

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

export const formatPostDate = (date: string, publishedAt: string | null | undefined, locale: LocaleCode): string => {
  if (!publishedAt) {
    return formatDate(date, locale);
  }
  return new Date(publishedAt).toLocaleString(getLocaleDateTag(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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

const POST_TAG_LOCALIZATIONS: Record<string, LocalizedText> = {
  algorithms: { 'zh-CN': '算法', en: 'Algorithms' },
  'string-algorithms': { 'zh-CN': '字符串算法', en: 'String Algorithms' },
  'data-structures': { 'zh-CN': '数据结构', en: 'Data Structures' },
};

const POST_TAG_ALIASES: Record<string, string> = {
  algorithm: 'algorithms',
  algorithms: 'algorithms',
  '算法': 'algorithms',
  'string-algorithm': 'string-algorithms',
  'string-algorithms': 'string-algorithms',
  '字符串算法': 'string-algorithms',
  'data-structure': 'data-structures',
  'data-structures': 'data-structures',
  '数据结构': 'data-structures',
};

const normalizeTagToken = (raw: string): string => raw.trim().toLowerCase().replace(/\s+/g, '-');

const containsCjk = (raw: string): boolean => /[\u3400-\u9fff]/u.test(raw);

const getCanonicalPostTag = (raw: string): string => {
  const normalized = normalizeTagToken(raw);
  return POST_TAG_ALIASES[normalized] ?? raw.trim();
};

export const localizePostTag = (raw: string, locale: LocaleCode): string => {
  const canonical = getCanonicalPostTag(raw);
  const localized = POST_TAG_LOCALIZATIONS[canonical];
  return localized ? getLocalizedText(localized, locale) : raw;
};

export const summarizePostTags = (posts: Array<Pick<PostEntry, 'tags'>>, locale: LocaleCode): Array<[string, number]> => {
  const counts = new Map<string, { count: number; variants: Map<string, number> }>();

  posts.forEach((post) => {
    post.tags.forEach((rawTag) => {
      const tag = rawTag.trim();
      if (!tag) {
        return;
      }

      const key = getCanonicalPostTag(tag);
      const entry = counts.get(key) ?? { count: 0, variants: new Map<string, number>() };
      entry.count += 1;
      entry.variants.set(tag, (entry.variants.get(tag) ?? 0) + 1);
      counts.set(key, entry);
    });
  });

  const pickDisplayTag = (key: string, variants: Map<string, number>): string => {
    const localized = POST_TAG_LOCALIZATIONS[key];
    if (localized) {
      return getLocalizedText(localized, locale);
    }

    const rankedVariants = [...variants.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
    if (rankedVariants.length === 0) {
      return key;
    }

    if (locale === 'zh-CN') {
      return rankedVariants.find(([variant]) => containsCjk(variant))?.[0] ?? rankedVariants[0][0];
    }

    return rankedVariants.find(([variant]) => !containsCjk(variant))?.[0] ?? rankedVariants[0][0];
  };

  return [...counts.entries()]
    .map(([key, entry]) => [pickDisplayTag(key, entry.variants), entry.count] as [string, number])
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6);
};
