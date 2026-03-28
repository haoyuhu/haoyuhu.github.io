import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ChevronRight,
  ChevronsDown,
  ExternalLink,
  FileCode,
  FileText,
  Folder,
  Github,
  Globe,
  MapPin,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  Terminal as TerminalIcon,
  Users,
  X,
} from 'lucide-react';
import BlogCard from './components/BlogCard';
import ChatTerminal from './components/ChatTerminal';
import ProjectCard from './components/ProjectCard';
import ResumeView from './components/ResumeView';
import StudioView from './components/StudioView';
import { PixelMascot } from './constants';
import { formatDate, getLocalizedText, localizePostTag, normalizeApiBaseUrl, summarizePostTags } from './lib/i18n';
import {
  ExperienceEntry,
  LocaleCode,
  MetricItem,
  NavigationItem,
  PortfolioBundle,
  PostEntry,
  ProjectItem,
  SystemIdentityItem,
  ThemeMode,
} from './types';

const PAGE_SIZE = 8;

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  home: FileCode,
  projects: Folder,
  resume: Briefcase,
  garden: TerminalIcon,
  articles: FileText,
  settings: Settings,
  studio: TerminalIcon,
};

const socialIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  github: Github,
  globe: Globe,
  link: ExternalLink,
};

const resolveRecommendedItem = <T,>(
  items: T[],
  requestedId: string | undefined,
  candidatesForItem: (item: T) => Array<string | undefined | null>,
): T | undefined => {
  const target = (requestedId || '').trim().toLowerCase();
  if (!target || target === 'auto') {
    return undefined;
  }

  return items.find((item) =>
    candidatesForItem(item).some((candidate) => (candidate || '').trim().toLowerCase() === target),
  );
};

type IdentityNarrative = {
  id: string;
  label: string;
  value: string;
  meta: string;
  detail: string;
  tags: string[];
};

type HomeSpotlightCard = {
  id: string;
  targetTab: string;
  kicker: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  body: React.ReactNode;
  footer?: React.ReactNode;
};

const buildSystemIdentityNarratives = (
  rows: SystemIdentityItem[],
  techStack: MetricItem[],
  locale: LocaleCode,
): IdentityNarrative[] => {
  return rows.map((row, index) => {
    const label = getLocalizedText(row.label, locale);
    const value = getLocalizedText(row.value, locale);
    const tags = row.useTechStackAsTags ? techStack.map((metric) => getLocalizedText(metric.name, locale)) : row.tags ?? [];
    return {
      id: `identity-${index}`,
      label,
      value,
      meta: `::${label.toLowerCase()}`,
      detail: getLocalizedText(row.detail, locale),
      tags,
    };
  });
};

const renderTerminalMeter = (level: number, slots = 10): string => {
  const filled = Math.max(0, Math.min(slots, Math.floor(level / 10)));
  return `[${'#'.repeat(filled)}${'.'.repeat(slots - filled)}]`;
};

const App: React.FC = () => {
  const [bundle, setBundle] = useState<PortfolioBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [locale, setLocale] = useState<LocaleCode>('zh-CN');
  const [typedBio, setTypedBio] = useState('');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [gardenLimit, setGardenLimit] = useState(PAGE_SIZE);
  const [articleLimit, setArticleLimit] = useState(PAGE_SIZE);
  const [careerLogCardHeight, setCareerLogCardHeight] = useState<number | null>(null);
  const [careerLogDescriptionMaxHeight, setCareerLogDescriptionMaxHeight] = useState<number | null>(null);
  const [careerLogDescriptionTruncated, setCareerLogDescriptionTruncated] = useState(false);
  const systemCardRef = useRef<HTMLDivElement | null>(null);
  const careerLogFlowRef = useRef<HTMLDivElement | null>(null);
  const careerLogProjectsRef = useRef<HTMLDivElement | null>(null);
  const careerLogDescriptionRef = useRef<HTMLDivElement | null>(null);

  const loadBundle = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const payload = (await response.json()) as PortfolioBundle;
      setBundle(payload);
      setLocale(payload.site.localeDefault || 'zh-CN');
    } catch (error) {
      setLoadError(String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBundle();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (nextTheme: ThemeMode) => {
      const shouldUseDark =
        nextTheme === 'dark' ||
        (nextTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', shouldUseDark);
    };
    applyTheme(theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    if (!bundle) {
      return;
    }
    const root = window.document.documentElement;
    root.style.setProperty('--accent', bundle.site.theme.accent);
    root.style.setProperty('--theme-background', bundle.site.theme.background);
    root.style.setProperty('--theme-panel', bundle.site.theme.panel);
    root.style.setProperty('--theme-border', bundle.site.theme.border);
    root.style.setProperty('--theme-text', bundle.site.theme.text);
    root.style.setProperty('--theme-muted', bundle.site.theme.muted);
    root.style.setProperty('--theme-success', bundle.site.theme.success);
    root.style.setProperty('--theme-warning', bundle.site.theme.warning);
    document.title = getLocalizedText(bundle.site.title, locale);
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', getLocalizedText(bundle.site.description, locale));
    }
  }, [bundle, locale]);

  useEffect(() => {
    if (!bundle) {
      return;
    }
    setTypedBio('');
    const biography = getLocalizedText(bundle.profile.biography, locale);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedBio(biography.slice(0, index));
      if (index >= biography.length) {
        window.clearInterval(timer);
      }
    }, 18);
    return () => window.clearInterval(timer);
  }, [bundle, locale]);

  useEffect(() => {
    if (!bundle || activeTab !== 'home') {
      return;
    }

    const systemCardElement = systemCardRef.current;
    const flowElement = careerLogFlowRef.current;
    const projectsElement = careerLogProjectsRef.current;
    const descriptionElement = careerLogDescriptionRef.current;
    if (!systemCardElement || !flowElement || !projectsElement || !descriptionElement) {
      return;
    }
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const computeCareerLogLayout = () => {
      if (!desktopQuery.matches) {
        setCareerLogCardHeight((current) => (current === null ? current : null));
        setCareerLogDescriptionMaxHeight((current) => (current === null ? current : null));
        return;
      }

      const systemCardHeight = systemCardElement.getBoundingClientRect().height;
      const flowHeight = flowElement.getBoundingClientRect().height;
      const projectsHeight = projectsElement.getBoundingClientRect().height;
      const flowStyle = window.getComputedStyle(flowElement);
      const lineHeight = parseFloat(window.getComputedStyle(descriptionElement).lineHeight);
      const gap = parseFloat(flowStyle.rowGap || flowStyle.gap || '0');

      if (
        !Number.isFinite(systemCardHeight) ||
        systemCardHeight <= 0 ||
        !Number.isFinite(flowHeight) ||
        !Number.isFinite(projectsHeight) ||
        !Number.isFinite(lineHeight) ||
        lineHeight <= 0
      ) {
        return;
      }

      const nextCardHeight = Math.floor(systemCardHeight);
      setCareerLogCardHeight((current) =>
        current !== null && Math.abs(current - nextCardHeight) < 1 ? current : nextCardHeight,
      );

      const availableHeight = Math.max(flowHeight - projectsHeight - gap, lineHeight * 3);
      const nextHeight = Math.floor(availableHeight);
      setCareerLogDescriptionMaxHeight((current) =>
        current !== null && Math.abs(current - nextHeight) < 1 ? current : nextHeight,
      );
    };

    computeCareerLogLayout();
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(computeCareerLogLayout);
    });

    observer.observe(systemCardElement);
    observer.observe(flowElement);
    observer.observe(projectsElement);
    desktopQuery.addEventListener('change', computeCareerLogLayout);

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener('change', computeCareerLogLayout);
    };
  }, [activeTab, bundle, locale]);

  useEffect(() => {
    if (!bundle || activeTab !== 'home') {
      return;
    }

    const descriptionElement = careerLogDescriptionRef.current;
    if (!descriptionElement) {
      return;
    }

    const updateTruncationState = () => {
      const isTruncated = descriptionElement.scrollHeight - descriptionElement.clientHeight > 1;
      setCareerLogDescriptionTruncated((current) => (current === isTruncated ? current : isTruncated));
    };

    updateTruncationState();
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateTruncationState);
    });

    observer.observe(descriptionElement);

    return () => observer.disconnect();
  }, [activeTab, bundle, locale, careerLogDescriptionMaxHeight]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 font-mono text-accent">
        <PixelMascot className="mb-6 h-24 w-24 animate-pulse text-accent" />
        <div className="flex items-center gap-2">
          <span className="animate-spin">/</span>
          <span>BOOTING_CONTENT_KERNEL...</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">Mounting /dev/portfolio...</div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 font-mono text-white">
        <div className="max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="mb-2 text-lg font-bold text-red-300">Bundle load failed</div>
          <p className="mb-4 text-sm text-slate-300">{loadError ?? 'Unknown error'}</p>
          <button
            onClick={() => void loadBundle()}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const studioEnabled =
    bundle.site.runtime.localStudioEnabled || import.meta.env.DEV || import.meta.env.VITE_ENABLE_STUDIO === 'true';
  const chatEnabled = bundle.site.runtime.chatEnabled;
  const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL ?? bundle.site.runtime.apiBaseUrl);
  const copy = bundle.site.copy;
  const posts = [...bundle.posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const notes = posts.filter((post) => post.kind === 'note');
  const articles = posts.filter((post) => post.kind === 'article');
  const navigation = bundle.site.navigation.filter((item) => studioEnabled || !item.studioOnly);
  const recommendations = bundle.site.homeRecommendations;

  const latestProject =
    resolveRecommendedItem<ProjectItem>(bundle.projects.items, recommendations.latestProject, (item) => [
      item.id,
      item.name,
      item.nameWithOwner,
    ]) ??
    bundle.projects.items.find((item) => item.featured) ??
    bundle.projects.items[0];
  const latestNote =
    resolveRecommendedItem<PostEntry>(notes, recommendations.latestNote, (post) => [
      post.id,
      post.slug,
      getLocalizedText(post.title, locale),
    ]) ?? notes[0];
  const latestArticle =
    resolveRecommendedItem<PostEntry>(articles, recommendations.latestArticle, (post) => [
      post.id,
      post.slug,
      getLocalizedText(post.title, locale),
    ]) ?? articles[0];
  const currentJob =
    resolveRecommendedItem<ExperienceEntry>(bundle.resume.experience, recommendations.currentRole, (experience) => [
      experience.id,
      getLocalizedText(experience.company, 'zh-CN'),
      getLocalizedText(experience.company, 'en'),
      getLocalizedText(experience.role, locale),
    ]) ?? bundle.resume.experience[0];
  const latestEducation = bundle.resume.education[0];
  const topPostTags = summarizePostTags(posts, locale);

  const uptime = new Date().getFullYear() - bundle.profile.careerStartYear;
  const systemIdentityNarratives = buildSystemIdentityNarratives(
    bundle.profile.systemIdentity,
    bundle.profile.techStack,
    locale,
  );
  const isStudioActive = activeTab === 'studio' && studioEnabled;

  const projectSortHint =
    getLocalizedText(
      copy.projectsSortHint ?? {
        'zh-CN': '按 stars、最近 push、forks、watchers 排序',
        en: 'Sorted by stars, recent pushes, forks, and watchers',
      },
      locale,
    );
  const followersLabel = getLocalizedText(
    copy.followersLabel ?? { 'zh-CN': '关注者', en: 'Followers' },
    locale,
  );
  const primaryProfileLink =
    bundle.profile.socialLinks.find((link) => link.url === bundle.profile.primaryUrl) ??
    bundle.profile.socialLinks[0] ??
    null;
  const PrimaryProfileLinkIcon =
    socialIconMap[primaryProfileLink?.icon || (bundle.profile.primaryUrl.includes('github.com') ? 'github' : 'globe')] ??
    ExternalLink;
  const primaryProfileLinkLabel = primaryProfileLink
    ? getLocalizedText(primaryProfileLink.label, locale)
    : getLocalizedText(copy.primaryLinkLabel ?? { 'zh-CN': '主链接', en: 'Primary Link' }, locale);
  const heroClassName = getLocalizedText(copy.heroClassName ?? bundle.profile.name, locale);

  const homeSpotlightCards: HomeSpotlightCard[] = [];
  const careerLogDescriptionStyle: React.CSSProperties = {
    maxHeight: careerLogDescriptionMaxHeight !== null ? `${careerLogDescriptionMaxHeight}px` : undefined,
    WebkitMaskImage: careerLogDescriptionTruncated
      ? 'linear-gradient(180deg, #000 0%, #000 calc(100% - 1.75rem), transparent 100%)'
      : undefined,
    maskImage: careerLogDescriptionTruncated
      ? 'linear-gradient(180deg, #000 0%, #000 calc(100% - 1.75rem), transparent 100%)'
      : undefined,
    WebkitMaskRepeat: careerLogDescriptionTruncated ? 'no-repeat' : undefined,
    maskRepeat: careerLogDescriptionTruncated ? 'no-repeat' : undefined,
  };

  if (latestProject) {
    homeSpotlightCards.push({
      id: 'latest-project',
      targetTab: 'projects',
      kicker: getLocalizedText(copy.widgets.latestProject, locale),
      title: latestProject.nameWithOwner,
      subtitle: latestProject.language,
      icon: Folder,
      body: (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-ide-text-dim">{getLocalizedText(latestProject.description, locale)}</p>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-ide-text-dim">
            <span className="rounded bg-ide-panel px-2 py-1">★ {latestProject.stars}</span>
            <span className="rounded bg-ide-panel px-2 py-1">Forks {latestProject.forks}</span>
            <span className="rounded bg-ide-panel px-2 py-1">
              {latestProject.relationship === 'owner'
                ? locale === 'zh-CN'
                  ? '维护仓库'
                  : 'Maintainer'
                : locale === 'zh-CN'
                  ? '贡献仓库'
                  : 'Contributor'}
            </span>
          </div>
        </div>
      ),
      footer: (
        <div className="flex flex-wrap gap-1">
          {latestProject.topics.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded border border-ide-border bg-ide-panel px-1.5 py-0.5 text-[10px] text-ide-text-dim">
              #{tag}
            </span>
          ))}
        </div>
      ),
    });
  }

  if (latestNote) {
    homeSpotlightCards.push({
      id: 'latest-note',
      targetTab: 'garden',
      kicker: getLocalizedText(copy.widgets.latestNote, locale),
      title: getLocalizedText(latestNote.title, locale),
      subtitle: formatDate(latestNote.date, locale),
      icon: TerminalIcon,
      body: (
        <blockquote className="border-l-2 border-ide-border pl-3 text-sm italic leading-6 text-ide-text">
          “{getLocalizedText(latestNote.summary, locale)}”
        </blockquote>
      ),
      footer: (
        <div className="flex flex-wrap gap-1">
          {latestNote.tags.map((tag) => (
            <span key={`${latestNote.id}-${tag}`} className="rounded bg-ide-panel px-1.5 py-0.5 text-[10px] text-ide-text-dim">
              #{localizePostTag(tag, locale)}
            </span>
          ))}
        </div>
      ),
    });
  }

  if (latestArticle) {
    homeSpotlightCards.push({
      id: 'latest-article',
      targetTab: 'articles',
      kicker: getLocalizedText(copy.widgets.latestArticle, locale),
      title: getLocalizedText(latestArticle.title, locale),
      subtitle: formatDate(latestArticle.date, locale),
      icon: FileText,
      body: (
        <p className="text-sm leading-6 text-ide-text-dim">{getLocalizedText(latestArticle.summary, locale)}</p>
      ),
      footer: (
        <div className="flex flex-wrap gap-1">
          {latestArticle.tags.map((tag) => (
            <span key={`${latestArticle.id}-${tag}`} className="rounded bg-ide-panel px-1.5 py-0.5 text-[10px] text-ide-text">
              #{localizePostTag(tag, locale)}
            </span>
          ))}
        </div>
      ),
    });
  }

  if (currentJob) {
    homeSpotlightCards.push({
      id: 'current-role',
      targetTab: 'resume',
      kicker: getLocalizedText(copy.widgets.currentRole, locale),
      title: getLocalizedText(currentJob.role, locale),
      subtitle: `@${getLocalizedText(currentJob.company, locale)}`,
      icon: Briefcase,
      body: (
        <div className="space-y-2 text-sm text-ide-text-dim">
          {currentJob.projects.length > 0
            ? currentJob.projects.slice(0, 3).map((project, projectIndex) => (
                <div key={`${currentJob.id}-${projectIndex}`} className="rounded border border-ide-border bg-ide-panel px-3 py-2">
                  <div className="font-semibold text-ide-text">{getLocalizedText(project.name, locale)}</div>
                  <div className="mt-1 leading-5">{getLocalizedText(project.description, locale)}</div>
                </div>
              ))
            : currentJob.description[locale].slice(0, 3).map((line) => (
                <div key={`${currentJob.id}-${line}`} className="rounded border border-ide-border bg-ide-panel px-3 py-2 leading-6">
                  {line}
                </div>
              ))}
        </div>
      ),
      footer: (
        <div className="flex items-center gap-1 text-[10px] text-ide-text-dim">
          <Calendar size={10} />
          {currentJob.startDate} - {currentJob.endDate}
        </div>
      ),
    });
  }

  if (latestEducation) {
    homeSpotlightCards.push({
      id: 'education',
      targetTab: 'resume',
      kicker: getLocalizedText(copy.widgets.education, locale),
      title: getLocalizedText(latestEducation.school, locale),
      subtitle: getLocalizedText(latestEducation.degree, locale),
      icon: Globe,
      body: (
        <p className="text-sm leading-6 text-ide-text-dim">
          {getLocalizedText(
            copy.widgets.educationBody ?? {
              'zh-CN': '当前履历中的最近教育节点，会在首页作为基础背景信息展示。',
              en: 'The latest education node from the resume is surfaced here as background context.',
            },
            locale,
          )}
        </p>
      ),
      footer: (
        <div className="flex items-center gap-1 text-[10px] text-ide-text-dim">
          <Calendar size={10} />
          {latestEducation.startDate} - {latestEducation.endDate}
        </div>
      ),
    });
  }

  homeSpotlightCards.push({
    id: 'signal-deck',
    targetTab: 'garden',
    kicker: getLocalizedText(copy.widgets.signalDeck, locale),
    title: getLocalizedText(
      copy.widgets.signalDeckTitle ?? {
        'zh-CN': '内容与仓库的实时脉冲',
        en: 'Pulse across content and repositories',
      },
      locale,
    ),
    subtitle: getLocalizedText(
      copy.widgets.signalDeckSubtitle ?? {
        'zh-CN': '配置、公开仓库与 Markdown 内容共同驱动首页卡片。',
        en: 'Config, public repositories, and Markdown content drive the home surface together.',
      },
      locale,
    ),
    icon: FileCode,
    body: (
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded border border-ide-border bg-ide-panel px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-ide-text-dim">
            {getLocalizedText(copy.widgets.signalDeckRepos ?? { 'zh-CN': '仓库', en: 'Repos' }, locale)}
          </div>
          <div className="mt-1 text-lg font-bold text-ide-text">{bundle.projects.items.length}</div>
        </div>
        <div className="rounded border border-ide-border bg-ide-panel px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-ide-text-dim">
            {getLocalizedText(copy.widgets.signalDeckNotes ?? { 'zh-CN': '短文', en: 'Notes' }, locale)}
          </div>
          <div className="mt-1 text-lg font-bold text-ide-text">{notes.length}</div>
        </div>
        <div className="rounded border border-ide-border bg-ide-panel px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-ide-text-dim">
            {getLocalizedText(copy.widgets.signalDeckArticles ?? { 'zh-CN': '文章', en: 'Articles' }, locale)}
          </div>
          <div className="mt-1 text-lg font-bold text-ide-text">{articles.length}</div>
        </div>
        <div className="rounded border border-ide-border bg-ide-panel px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-ide-text-dim">
            {getLocalizedText(copy.widgets.signalDeckFollowers ?? { 'zh-CN': '关注者', en: 'Followers' }, locale)}
          </div>
          <div className="mt-1 text-lg font-bold text-ide-text">{bundle.profile.stats.followers}</div>
        </div>
      </div>
    ),
    footer:
      topPostTags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {topPostTags.map(([tag, count]) => (
            <span key={tag} className="rounded border border-ide-border bg-ide-panel px-2 py-1 text-[10px] text-ide-text-dim">
              #{tag} x{count}
            </span>
          ))}
        </div>
      ) : undefined,
  });

  const NavItem = ({ item, depth = 0 }: { item: NavigationItem; depth?: number }) => {
    const Icon = iconMap[item.id] ?? FileCode;
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
          setMobileMenuOpen(false);
        }}
        className={`w-full border-l-2 px-3 py-1.5 text-left text-sm font-mono transition-all ${
          activeTab === item.id
            ? 'border-accent bg-ide-panel font-bold text-ide-text'
            : 'border-transparent text-ide-text-dim hover:bg-ide-panel hover:text-ide-text'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        <span className="flex items-center gap-2">
          <Icon size={14} className={activeTab === item.id ? 'text-accent' : 'text-ide-text-dim'} />
          <span>{item.fileLabel}</span>
        </span>
      </button>
    );
  };

  const SpotlightCard = ({ card }: { card: HomeSpotlightCard }) => {
    const Icon = card.icon;
    return (
      <div className="mb-4 inline-block w-full break-inside-avoid">
        <button
          onClick={() => setActiveTab(card.targetTab)}
          className="group flex w-full cursor-pointer flex-col rounded-xl border border-ide-border bg-ide-bg p-5 text-left transition-all hover:border-accent hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase text-ide-text-dim">
              <Icon size={14} className="shrink-0 text-accent" />
              <span className="truncate">{card.kicker}</span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-ide-text-dim transition-colors group-hover:text-accent" />
          </div>
          <div className="space-y-2">
            <h3 className="break-words text-lg font-bold text-ide-text transition-colors group-hover:text-accent">
              {card.title}
            </h3>
            {card.subtitle && <p className="text-sm text-ide-text-dim">{card.subtitle}</p>}
          </div>
          <div className="mt-4">{card.body}</div>
          {card.footer && <div className="mt-4">{card.footer}</div>}
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-ide-bg font-mono text-ide-text transition-colors duration-300">
      <div className="z-30 flex h-10 items-center justify-between border-b border-ide-border bg-ide-panel px-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </div>
          <span className="ml-4 hidden text-xs text-ide-text-dim sm:block">{getLocalizedText(bundle.site.title, locale)}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-ide-text-dim">
          <div className="flex items-center gap-2 rounded border border-ide-border bg-ide-bg px-2 py-1">
            <Globe size={12} />
            <button onClick={() => setLocale('zh-CN')} className={locale === 'zh-CN' ? 'text-accent' : ''}>
              中文
            </button>
            <button onClick={() => setLocale('en')} className={locale === 'en' ? 'text-accent' : ''}>
              EN
            </button>
          </div>
          <div className="flex rounded border border-ide-border bg-ide-bg p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`rounded p-1 ${theme === 'light' ? 'bg-ide-panel text-accent' : ''}`}
              title="Light Mode"
            >
              <Sun size={12} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`rounded p-1 ${theme === 'system' ? 'bg-ide-panel text-accent' : ''}`}
              title="System Mode"
            >
              <Monitor size={12} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`rounded p-1 ${theme === 'dark' ? 'bg-ide-panel text-accent' : ''}`}
              title="Dark Mode"
            >
              <Moon size={12} />
            </button>
          </div>
          <a href={bundle.profile.primaryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 transition-colors hover:text-accent">
            <PrimaryProfileLinkIcon size={12} />
            {primaryProfileLinkLabel}
          </a>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <aside
          className={`absolute inset-y-0 left-0 z-40 w-64 border-r border-ide-border bg-ide-panel transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-2 flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-ide-text-dim">
            <span>{getLocalizedText(copy.explorerLabel, locale)}</span>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1 px-3 py-1 text-sm font-bold text-ide-text">
              <ChevronRight size={14} className="rotate-90 text-ide-text-dim" />
              <span>PORTFOLIO</span>
            </div>
            {navigation.map((item) => (
              <NavItem key={item.id} item={item} depth={1} />
            ))}

            <div className="mt-6 px-3">
              <div className="mb-2 text-xs font-bold uppercase text-ide-text-dim">
                {getLocalizedText(copy.externalLabel, locale)}
              </div>
              {bundle.profile.socialLinks.map((link) => (
                (() => {
                  const LinkIcon = socialIconMap[link.icon || 'link'] ?? ExternalLink;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-ide-text-dim transition-colors hover:text-accent"
                    >
                      <LinkIcon size={14} />
                      <span className="truncate">{getLocalizedText(link.label, locale)}</span>
                    </a>
                  );
                })()
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-ide-border bg-ide-panel p-4">
            <div className="flex items-center gap-3">
              <img
                src={bundle.profile.avatarUrl}
                className="h-8 w-8 rounded object-cover ring-2 ring-ide-border"
                alt="Avatar"
              />
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-ide-text">{bundle.profile.name}</div>
                <div className="truncate text-[10px] text-ide-text-dim">@{bundle.site.ownerHandle}</div>
              </div>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        <main className="relative flex min-w-0 flex-1 flex-col bg-ide-bg">
          <div className="z-20 flex items-center overflow-x-auto border-b border-ide-border bg-ide-panel">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-ide-text-dim md:hidden">
              <Menu size={18} />
            </button>
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex min-w-max items-center gap-2 border-r border-ide-border px-4 py-2 text-sm transition-colors ${
                  activeTab === item.id
                    ? 'border-t-2 border-t-accent bg-ide-bg text-accent'
                    : 'bg-ide-panel text-ide-text-dim hover:bg-ide-bg/40'
                }`}
              >
                <span>{item.fileLabel}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-b border-ide-border bg-ide-bg px-4 py-1.5 text-xs text-ide-text-dim">
            <span>portfolio</span>
            <span>&gt;</span>
            <span className="text-ide-text">{navigation.find((item) => item.id === activeTab)?.fileLabel ?? activeTab}</span>
            {activeTab === 'home' && (
              <span className="ml-auto flex items-center gap-1 text-accent">
                ● {getLocalizedText(copy.liveServer, locale)}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl pb-10">
              {activeTab === 'home' && (
                <div className="space-y-6">
                  <section className="flex flex-col gap-6 border-b border-dashed border-ide-border pb-6 md:flex-row md:items-start">
                    <div className="relative shrink-0">
                      <img
                        src={bundle.profile.avatarUrl}
                        className="h-24 w-24 rounded-xl border-2 border-ide-border object-cover shadow-sm md:h-28 md:w-28"
                        alt={bundle.profile.name}
                      />
                      <div className="absolute -bottom-2 -right-2 rounded-lg border border-ide-border bg-ide-bg p-1.5">
                        <PixelMascot className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <h1 className="text-xl font-bold tracking-tight text-ide-text md:text-2xl lg:text-3xl">
                        <span className="text-accent">class</span> {heroClassName}{' '}
                        <span className="text-accent">extends</span>{' '}
                        <span className="text-ide-text-dim">{getLocalizedText(bundle.profile.heroExtends, locale)}</span>
                      </h1>
                      <div className="rounded border border-ide-border bg-ide-panel/50 p-3 text-sm leading-relaxed text-ide-text md:text-base">
                        <span className="text-accent">def init(self):</span>
                        <br />
                        <span className="pl-4 text-ide-text-dim">""" </span>
                        {typedBio}
                        <span className="ml-1 inline-block h-4 w-2 animate-cursor-blink bg-accent align-middle" />
                        <span className="text-ide-text-dim"> """</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-ide-text-dim">
                        <div className="flex items-center gap-1 rounded bg-ide-panel px-2 py-1">
                          <MapPin size={12} /> {getLocalizedText(bundle.profile.location, locale)}
                        </div>
                        <div className="flex items-center gap-1 rounded bg-ide-panel px-2 py-1">
                          <Users size={12} /> {bundle.profile.stats.followers} {followersLabel}
                        </div>
                        {bundle.profile.email && (
                          <div className="max-w-full break-all rounded bg-ide-panel px-2 py-1">{bundle.profile.email}</div>
                        )}
                      </div>
                    </div>
                  </section>

                  <div className="grid items-start gap-6 lg:grid-cols-2">
                    <section ref={systemCardRef} className="flex min-h-[320px] flex-col rounded-xl border border-ide-border bg-ide-panel p-6 shadow-sm">
                      <div className="mb-4 text-xs text-ide-text-dim">neofetch_v3.sh</div>
                      <div className="mb-4 text-xs">
                        <span className="font-bold text-accent">{bundle.site.ownerHandle}@portfolio</span>:
                        <span className="text-sky-400">~</span>$ ./display_specs.sh --verbose
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ide-text-dim">
                            {getLocalizedText(copy.systemIdentity, locale)}
                          </div>
                          <div className="space-y-4">
                            {systemIdentityNarratives.map((entry) => (
                              <div
                                key={entry.id}
                                className="border-l-2 border-ide-border pl-4 transition-colors hover:border-accent"
                              >
                                <div className="mb-1 flex flex-wrap justify-between gap-2 text-xs text-ide-text-dim">
                                  <span>{entry.label}</span>
                                  <span>{entry.meta}</span>
                                </div>
                                <div className="break-words text-base font-bold text-ide-text">{entry.value}</div>
                                <div className="mt-1 break-words text-xs leading-6 text-ide-text-dim">{entry.detail}</div>
                                {entry.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {entry.tags.map((tag) => (
                                      <span
                                        key={`${entry.id}-${tag}`}
                                        className="rounded border border-ide-border bg-ide-bg px-2 py-1 text-[10px] uppercase tracking-wide text-ide-text-dim"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ide-text-dim">
                            {getLocalizedText(copy.toolTelemetry, locale)}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {bundle.profile.aiTools.map((tool) => (
                              <div key={tool.name} className="rounded border border-ide-border bg-ide-bg p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="break-words text-sm font-semibold text-ide-text">{tool.name}</div>
                                    <div className="mt-1 text-[10px] uppercase tracking-wide text-sky-400">
                                      {tool.rating}
                                    </div>
                                  </div>
                                  <div className="text-[10px] uppercase tracking-wide text-ide-text-dim">{tool.usage}</div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-6 text-ide-text">
                                  <span className="font-bold tracking-tight text-accent">
                                    {renderTerminalMeter(tool.level)}
                                  </span>
                                  <span className="text-ide-text-dim">{tool.level}%</span>
                                </div>
                                <p className="mt-2 break-words text-[11px] leading-5 text-ide-text-dim">
                                  {getLocalizedText(tool.summary, locale)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section
                      className="flex min-h-[320px] flex-col rounded-xl border border-ide-border bg-ide-panel p-6 shadow-sm lg:h-full"
                      style={{
                        height: careerLogCardHeight !== null ? `${careerLogCardHeight}px` : undefined,
                      }}
                    >
                      <div className="mb-4 text-xs text-ide-text-dim">career_log.txt</div>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-accent">
                          <TerminalIcon size={16} />
                          <span>{getLocalizedText(copy.careerLog, locale)}</span>
                        </div>
                        <div className="rounded border border-ide-border bg-ide-bg px-2 py-1 text-[10px] uppercase tracking-wide text-ide-text-dim">
                          {locale === 'zh-CN'
                            ? `${uptime} ${getLocalizedText(copy.yearsExperienceLabel ?? { 'zh-CN': '年经验', en: 'years experience' }, locale)}`
                            : `${uptime} ${getLocalizedText(copy.yearsExperienceLabel ?? { 'zh-CN': '年经验', en: 'years experience' }, locale)}`}
                        </div>
                      </div>
                      <div className="flex flex-1 min-h-0 flex-col">
                        {bundle.resume.experience.slice(0, 1).map((experience) => (
                          <div key={experience.id} className="flex h-full min-h-0 flex-col border-l-2 border-ide-border pl-4 transition-colors hover:border-accent">
                            <div className="mb-1 flex flex-wrap justify-between gap-2 text-xs text-ide-text-dim">
                              <span>
                                {experience.startDate} - {experience.endDate}
                              </span>
                              <span>{getLocalizedText(experience.location, locale)}</span>
                            </div>
                            <div className="text-base font-bold text-ide-text">{getLocalizedText(experience.role, locale)}</div>
                            <div className="mb-3 text-xs text-sky-400">@{getLocalizedText(experience.company, locale)}</div>
                            <div ref={careerLogFlowRef} className="flex min-h-0 flex-1 flex-col gap-3">
                              <div
                                ref={careerLogDescriptionRef}
                                className="overflow-hidden whitespace-pre-line break-words text-xs leading-5 text-ide-text-dim"
                                style={careerLogDescriptionStyle}
                              >
                                {experience.description[locale].join('\n')}
                              </div>
                              <div ref={careerLogProjectsRef} className="space-y-3">
                                {experience.projects.map((project, projectIndex) => (
                                  <div key={`${experience.id}-${projectIndex}`} className="rounded border border-ide-border bg-ide-bg px-3 py-2 text-xs text-ide-text-dim">
                                    <div className="font-semibold text-ide-text">{getLocalizedText(project.name, locale)}</div>
                                    <div className="mt-1 leading-5">{getLocalizedText(project.description, locale)}</div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {project.tech.map((tech, techIndex) => (
                                        <span
                                          key={`${experience.id}-${projectIndex}-${techIndex}`}
                                          className="rounded border border-ide-border bg-ide-panel px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ide-text-dim"
                                        >
                                          {getLocalizedText(tech, locale)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 border-t border-ide-border pt-4">
                        <button
                          onClick={() => setActiveTab('resume')}
                          className="group inline-flex items-center gap-2 rounded border border-ide-border bg-ide-bg px-3 py-2 text-sm text-ide-text-dim transition-all hover:border-accent hover:text-accent"
                        >
                          <span>{getLocalizedText(copy.resumeCta, locale)}</span>
                          <span className="text-[10px] uppercase tracking-wide text-ide-text-dim group-hover:text-accent">
                            cv.yaml
                          </span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </section>
                  </div>

                  <div className="columns-1 gap-4 md:columns-2 2xl:columns-3">
                    {homeSpotlightCards.map((card) => (
                      <SpotlightCard key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resume' && <ResumeView resume={bundle.resume} locale={locale} copy={copy} />}

              {activeTab === 'projects' && (
                <div>
                  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-ide-text">
                        <span className="text-accent">def</span> list_repositories():
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-ide-text-dim">{projectSortHint}</p>
                    </div>
                    <div className="text-xs text-ide-text-dim">
                      {bundle.projects.items.length} repos | github canonical sync
                    </div>
                  </div>

                  {bundle.projects.items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {bundle.projects.items.map((project) => (
                        <ProjectCard key={project.id} project={project} locale={locale} copy={copy} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-ide-border bg-ide-panel p-6 text-sm text-ide-text-dim">
                      {getLocalizedText(
                        copy.projectsEmptyState ?? {
                          'zh-CN': '尚未同步到公开仓库数据，请先运行 portfolio sync github。',
                          en: 'No public repositories are cached yet. Run portfolio sync github first.',
                        },
                        locale,
                      )}
                    </div>
                  )}

                  <div className="mt-8 rounded border border-dashed border-ide-border bg-ide-panel p-4 text-center text-sm text-ide-text-dim">
                    {getLocalizedText(copy.projectsFooter, locale)}
                  </div>
                </div>
              )}

              {activeTab === 'garden' && (
                <div className="relative pl-4 md:pl-8">
                  <div className="absolute bottom-0 left-0 top-0 ml-3 w-px bg-ide-border md:ml-0" />
                  <h2 className="mb-6 pl-4 text-xl font-bold text-ide-text">
                    <span className="text-accent">while</span> brain.is_active():
                  </h2>
                  <div className="space-y-4">
                    {notes.slice(0, gardenLimit).map((post) => (
                      <BlogCard key={post.id} post={post} locale={locale} />
                    ))}
                  </div>
                  {notes.length > gardenLimit && (
                    <div className="mt-8 pl-4">
                      <button
                        onClick={() => setGardenLimit((current) => current + PAGE_SIZE)}
                        className="flex w-full items-center justify-center gap-2 rounded border border-ide-border bg-ide-panel py-2 text-sm text-ide-text-dim transition-all hover:border-accent hover:text-accent"
                      >
                        <ChevronsDown size={14} />
                        {getLocalizedText(copy.loadMore, locale)}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'articles' && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-ide-text">
                    <span className="text-accent">import</span> knowledge
                  </h2>
                  <div className="space-y-4">
                    {articles.slice(0, articleLimit).map((post, index) => (
                      <BlogCard key={post.id} post={post} locale={locale} defaultExpanded={index === 0} />
                    ))}
                  </div>
                  {articles.length > articleLimit && (
                    <div className="mt-8">
                      <button
                        onClick={() => setArticleLimit((current) => current + PAGE_SIZE)}
                        className="flex w-full items-center justify-center gap-2 rounded border border-ide-border bg-ide-panel py-2 text-sm text-ide-text-dim transition-all hover:border-accent hover:text-accent"
                      >
                        <ChevronsDown size={14} />
                        {getLocalizedText(copy.loadMore, locale)}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="rounded-lg border border-ide-border bg-ide-panel p-6 text-sm shadow-sm">
                  <div className="mb-4 text-ide-text-dim"># {getLocalizedText(copy.settingsHeading, locale)}</div>
                  <div className="grid gap-3 text-ide-text sm:grid-cols-[160px_minmax(0,1fr)]">
                    <span className="text-accent">GENERATED_AT</span>
                    <span className="break-all">= "{bundle.generated.generatedAt}"</span>

                    <span className="text-accent">THEME_MODE</span>
                    <span className="break-all">= "{theme}"</span>

                    <span className="text-accent">AI_MODEL</span>
                    <span className="break-all">= "{bundle.site.settingsPanel.aiModelLabel}"</span>

                    <span className="text-accent">VERSION</span>
                    <span className="break-all">= "{bundle.site.settingsPanel.version}"</span>

                    <span className="text-accent">API_BASE</span>
                    <span className="break-all">= "{apiBaseUrl || 'local-only disabled'}"</span>
                  </div>
                  <div className="mt-8 border-t border-ide-border pt-4">
                    <div className="mb-2 text-ide-text-dim"># {getLocalizedText(copy.scriptsHeading, locale)}</div>
                    <div className="overflow-x-auto rounded border border-ide-border bg-ide-bg p-3">
                      {bundle.site.settingsPanel.scripts.map((script) => (
                        <div key={script} className="break-all">
                          {script}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isStudioActive && (
                <StudioView bundle={bundle} locale={locale} apiBaseUrl={apiBaseUrl} onBundleReload={loadBundle} />
              )}
            </div>
          </div>

          <div className="z-50 flex h-6 items-center justify-between bg-accent px-3 text-[10px] text-white">
            <div className="flex items-center gap-4">
              <span className="font-bold">NORMAL</span>
              <span>{bundle.site.statusBar.branchLabel}</span>
              <span>{getLocalizedText(bundle.site.statusBar.diagnosticsLabel, locale)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Ln 42, Col 12</span>
              <span>{bundle.site.statusBar.encodingLabel}</span>
              <span>{bundle.site.statusBar.fileTypeLabel}</span>
            </div>
          </div>

          {chatEnabled && (
            <>
              <button
                onClick={() => setTerminalOpen(true)}
                className="fixed bottom-10 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ff7a55] bg-accent text-white shadow-lg transition-transform hover:scale-110"
                aria-label="Open terminal"
              >
                <TerminalIcon size={24} />
              </button>

              <ChatTerminal
                assistant={bundle.assistant}
                locale={locale}
                apiBaseUrl={apiBaseUrl}
                isOpen={terminalOpen}
                onClose={() => setTerminalOpen(false)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
