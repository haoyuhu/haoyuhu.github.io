import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ChevronRight,
  ChevronsDown,
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
import { formatDate, getLocalizedText, normalizeApiBaseUrl } from './lib/i18n';
import { LocaleCode, NavigationItem, PortfolioBundle, ThemeMode } from './types';

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

  const loadBundle = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`/data.json?ts=${Date.now()}`, { cache: 'no-store' });
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
      const shouldUseDark = nextTheme === 'dark' || (nextTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  const studioEnabled = useMemo(() => {
    if (!bundle) {
      return false;
    }
    return bundle.site.runtime.localStudioEnabled || import.meta.env.DEV || import.meta.env.VITE_ENABLE_STUDIO === 'true';
  }, [bundle]);

  const apiBaseUrl = useMemo(() => {
    if (!bundle) {
      return '';
    }
    return normalizeApiBaseUrl(import.meta.env.VITE_API_URL ?? bundle.site.runtime.apiBaseUrl);
  }, [bundle]);

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
          <button onClick={() => void loadBundle()} className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const copy = bundle.site.copy;
  const posts = [...bundle.posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const notes = posts.filter((post) => post.kind === 'note');
  const articles = posts.filter((post) => post.kind === 'article');
  const latestProject = bundle.projects.items.find((item) => item.featured) ?? bundle.projects.items[0];
  const latestNote = notes[0];
  const latestArticle = articles[0];
  const currentJob = bundle.resume.experience[0];
  const uptime = new Date().getFullYear() - bundle.profile.careerStartYear;
  const navigation = bundle.site.navigation.filter((item) => studioEnabled || !item.studioOnly);
  const isStudioActive = activeTab === 'studio' && studioEnabled;

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
            ? 'border-accent bg-ide-panel text-ide-text font-bold'
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
            <button onClick={() => setTheme('light')} className={`rounded p-1 ${theme === 'light' ? 'bg-ide-panel text-accent' : ''}`} title="Light Mode">
              <Sun size={12} />
            </button>
            <button onClick={() => setTheme('system')} className={`rounded p-1 ${theme === 'system' ? 'bg-ide-panel text-accent' : ''}`} title="System Mode">
              <Monitor size={12} />
            </button>
            <button onClick={() => setTheme('dark')} className={`rounded p-1 ${theme === 'dark' ? 'bg-ide-panel text-accent' : ''}`} title="Dark Mode">
              <Moon size={12} />
            </button>
          </div>
          <a href={bundle.profile.primaryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 transition-colors hover:text-accent">
            <Github size={12} />
            GitHub
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
              <div className="mb-2 text-xs font-bold uppercase text-ide-text-dim">{getLocalizedText(copy.externalLabel, locale)}</div>
              {bundle.profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-ide-text-dim transition-colors hover:text-accent"
                >
                  <Github size={14} />
                  {getLocalizedText(link.label, locale)}
                </a>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-ide-border bg-ide-panel p-4">
            <div className="flex items-center gap-3">
              <img src={bundle.profile.avatarUrl} className="h-8 w-8 rounded object-cover ring-2 ring-ide-border" alt="Avatar" />
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-ide-text">{bundle.profile.name}</div>
                <div className="truncate text-[10px] text-ide-text-dim">@{bundle.site.ownerHandle}</div>
              </div>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}

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
                  activeTab === item.id ? 'border-t-2 border-t-accent bg-ide-bg text-accent' : 'bg-ide-panel text-ide-text-dim hover:bg-ide-bg/40'
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
                      <img src={bundle.profile.avatarUrl} className="h-24 w-24 rounded-xl border-2 border-ide-border object-cover shadow-sm md:h-28 md:w-28" alt={bundle.profile.name} />
                      <div className="absolute -bottom-2 -right-2 rounded-lg border border-ide-border bg-ide-bg p-1.5">
                        <PixelMascot className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <h1 className="text-xl font-bold tracking-tight text-ide-text md:text-2xl lg:text-3xl">
                        <span className="text-accent">class</span> {bundle.profile.name} <span className="text-accent">extends</span>{' '}
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
                          <Users size={12} /> {bundle.profile.stats.followers} followers
                        </div>
                        {bundle.profile.email && <div className="rounded bg-ide-panel px-2 py-1">{bundle.profile.email}</div>}
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <section className="flex h-[320px] flex-col overflow-hidden rounded-xl border border-ide-border bg-ide-panel p-6 shadow-sm">
                      <div className="mb-4 text-xs text-ide-text-dim">neofetch_v3.sh</div>
                      <div className="mb-4 text-xs">
                        <span className="font-bold text-accent">{bundle.site.ownerHandle}@portfolio</span>:<span className="text-sky-400">~</span>$ ./display_specs.sh --verbose
                      </div>
                      <div className="grid flex-1 gap-6 overflow-y-auto pr-2 sm:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ide-text-dim">
                              {getLocalizedText(copy.systemIdentity, locale)}
                            </div>
                            <div className="whitespace-pre text-xs leading-6 text-ide-text">
                              {bundle.profile.systemIdentity
                                .map(
                                  (row) =>
                                    `${getLocalizedText(row.label, locale).padEnd(10, ' ')}: ${getLocalizedText(row.value, locale)}`,
                                )
                                .join('\n')}
                              {'\n'}
                              {`Uptime    : ${uptime} Years`}
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ide-text-dim">
                              {getLocalizedText(copy.techMetrics, locale)}
                            </div>
                            <div className="space-y-2">
                              {bundle.profile.techStack.map((metric) => (
                                <div key={metric.name} className="flex items-center text-xs">
                                  <span className="w-20 shrink-0 opacity-80">{metric.name}</span>
                                  <span className="mr-2 font-bold tracking-tight text-accent">
                                    {'[' + '#'.repeat(Math.floor(metric.level / 10)) + '.'.repeat(10 - Math.floor(metric.level / 10)) + ']'}
                                  </span>
                                  <span className="opacity-60">{metric.level}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ide-text-dim">
                            {getLocalizedText(copy.toolTelemetry, locale)}
                          </div>
                          <div className="overflow-x-auto rounded border border-ide-border bg-ide-bg p-2 text-[11px] text-ide-text">
                            {`+-------------+-------+--------+\n| TOOL        | USAGE | RATING |\n+-------------+-------+--------+\n${bundle.profile.aiTools
                              .map((tool) => `| ${tool.name.padEnd(11)} | ${tool.usage.padEnd(5)} | ${tool.rating.padEnd(6)} |`)
                              .join('\n')}\n+-------------+-------+--------+`}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="flex h-[320px] flex-col overflow-hidden rounded-xl border border-ide-border bg-ide-panel p-6 shadow-sm">
                      <div className="mb-4 text-xs text-ide-text-dim">career_log.txt</div>
                      <div className="mb-4 flex items-center gap-2 font-bold text-accent">
                        <TerminalIcon size={16} />
                        <span>{getLocalizedText(copy.careerLog, locale)}</span>
                      </div>
                      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        {bundle.resume.experience.map((experience) => (
                          <div key={experience.id} className="border-l-2 border-ide-border pl-4 transition-colors hover:border-accent">
                            <div className="mb-1 flex justify-between text-xs text-ide-text-dim">
                              <span>
                                {experience.startDate} - {experience.endDate}
                              </span>
                              <span>{getLocalizedText(experience.location, locale)}</span>
                            </div>
                            <div className="text-base font-bold text-ide-text">{getLocalizedText(experience.role, locale)}</div>
                            <div className="mb-1 text-xs text-sky-400">@{experience.company}</div>
                            <div className="line-clamp-1 text-xs text-ide-text-dim">{experience.description[locale][0]}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {latestProject && (
                      <button
                        onClick={() => setActiveTab('projects')}
                        className="group rounded-xl border border-ide-border bg-ide-bg p-5 text-left transition-all hover:border-accent hover:shadow-md"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-ide-text-dim">
                            <Folder size={14} className="text-accent" />
                            {getLocalizedText(copy.widgets.latestProject, locale)}
                          </span>
                          <ArrowRight size={16} className="text-ide-text-dim transition-colors group-hover:text-accent" />
                        </div>
                        <h3 className="mb-1 truncate text-lg font-bold text-ide-text transition-colors group-hover:text-accent">{latestProject.name}</h3>
                        <p className="line-clamp-2 text-sm text-ide-text-dim">{getLocalizedText(latestProject.description, locale)}</p>
                      </button>
                    )}

                    {latestNote && (
                      <button
                        onClick={() => setActiveTab('garden')}
                        className="group rounded-xl border border-ide-border bg-ide-bg p-5 text-left transition-all hover:border-accent hover:shadow-md"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-ide-text-dim">
                            <TerminalIcon size={14} className="text-accent" />
                            {getLocalizedText(copy.widgets.latestNote, locale)}
                          </span>
                          <ArrowRight size={16} className="text-ide-text-dim transition-colors group-hover:text-accent" />
                        </div>
                        <div className="line-clamp-4 border-l-2 border-ide-panel pl-3 text-sm italic text-ide-text">
                          “{getLocalizedText(latestNote.summary, locale)}”
                        </div>
                        <div className="mt-4 text-[10px] text-ide-text-dim">{formatDate(latestNote.date, locale)}</div>
                      </button>
                    )}

                    {latestArticle && (
                      <button
                        onClick={() => setActiveTab('articles')}
                        className="group rounded-xl border border-ide-border bg-ide-bg p-5 text-left transition-all hover:border-accent hover:shadow-md"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-ide-text-dim">
                            <FileText size={14} className="text-accent" />
                            {getLocalizedText(copy.widgets.latestArticle, locale)}
                          </span>
                          <ArrowRight size={16} className="text-ide-text-dim transition-colors group-hover:text-accent" />
                        </div>
                        <h3 className="mb-2 text-base font-bold text-ide-text transition-colors group-hover:text-accent">
                          {getLocalizedText(latestArticle.title, locale)}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {latestArticle.tags.map((tag) => (
                            <span key={tag} className="rounded bg-ide-panel px-1.5 py-0.5 text-[10px] text-ide-text">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    )}

                    {currentJob && (
                      <button
                        onClick={() => setActiveTab('resume')}
                        className="group rounded-xl border border-ide-border bg-ide-bg p-5 text-left transition-all hover:border-accent hover:shadow-md"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-ide-text-dim">
                            <Briefcase size={14} className="text-accent" />
                            {getLocalizedText(copy.widgets.currentRole, locale)}
                          </span>
                          <ArrowRight size={16} className="text-ide-text-dim transition-colors group-hover:text-accent" />
                        </div>
                        <h3 className="text-base font-bold text-ide-text">{getLocalizedText(currentJob.role, locale)}</h3>
                        <p className="mt-1 text-sm text-ide-text-dim">@{currentJob.company}</p>
                        <div className="mt-3 flex items-center gap-1 text-[10px] text-ide-text-dim">
                          <Calendar size={10} />
                          {currentJob.startDate} - {currentJob.endDate}
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'resume' && <ResumeView resume={bundle.resume} locale={locale} />}

              {activeTab === 'projects' && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-ide-text">
                    <span className="text-accent">def</span> get_featured_projects():
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {bundle.projects.items.map((project) => (
                      <ProjectCard key={project.id} project={project} locale={locale} />
                    ))}
                  </div>
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
                  <div className="grid grid-cols-[180px_1fr] gap-y-2 text-ide-text">
                    <span className="text-accent">GENERATED_AT</span>
                    <span>= "{bundle.generated.generatedAt}"</span>

                    <span className="text-accent">THEME_MODE</span>
                    <span>= "{theme}"</span>

                    <span className="text-accent">AI_MODEL</span>
                    <span>= "{bundle.site.settingsPanel.aiModelLabel}"</span>

                    <span className="text-accent">VERSION</span>
                    <span>= "{bundle.site.settingsPanel.version}"</span>

                    <span className="text-accent">API_BASE</span>
                    <span>= "{apiBaseUrl || 'local-only disabled'}"</span>
                  </div>
                  <div className="mt-8 border-t border-ide-border pt-4">
                    <div className="mb-2 text-ide-text-dim"># {getLocalizedText(copy.scriptsHeading, locale)}</div>
                    <div className="rounded border border-ide-border bg-ide-bg p-3">
                      {bundle.site.settingsPanel.scripts.map((script) => (
                        <div key={script}>{script}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isStudioActive && <StudioView bundle={bundle} locale={locale} apiBaseUrl={apiBaseUrl} onBundleReload={loadBundle} />}
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
        </main>
      </div>
    </div>
  );
};

export default App;
