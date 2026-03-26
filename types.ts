export type LocaleCode = 'zh-CN' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';
export type LocalizedText = Record<LocaleCode, string>;
export type LocalizedLines = Record<LocaleCode, string[]>;

export interface LinkItem {
  id: string;
  label: LocalizedText;
  url: string;
  icon?: string | null;
}

export interface NavigationItem {
  id: string;
  label: LocalizedText;
  fileLabel: string;
  studioOnly?: boolean;
}

export interface ThemeTokens {
  accent: string;
  background: string;
  panel: string;
  border: string;
  text: string;
  muted: string;
  success: string;
  warning: string;
}

export interface SiteSettingsPanel {
  aiModelLabel: string;
  version: string;
  scripts: string[];
}

export interface SiteStatusBar {
  branchLabel: string;
  diagnosticsLabel: LocalizedText;
  fileTypeLabel: string;
  encodingLabel: string;
}

export interface RuntimeSettings {
  apiBaseUrl?: string | null;
  localStudioEnabled: boolean;
  publicSite: boolean;
}

export interface StudioConfig {
  title: LocalizedText;
  description: LocalizedText;
  supportVoiceViaCli: boolean;
}

export interface SiteConfig {
  title: LocalizedText;
  description: LocalizedText;
  localeDefault: LocaleCode;
  ownerHandle: string;
  navigation: NavigationItem[];
  theme: ThemeTokens;
  settingsPanel: SiteSettingsPanel;
  statusBar: SiteStatusBar;
  runtime: RuntimeSettings;
  studio: StudioConfig;
  copy: Record<string, any>;
}

export interface ProfileStats {
  publicRepos: number;
  followers: number;
  following: number;
}

export interface SystemIdentityItem {
  label: LocalizedText;
  value: LocalizedText;
}

export interface MetricItem {
  name: string;
  level: number;
}

export interface ToolTelemetryItem {
  name: string;
  usage: string;
  rating: string;
}

export interface ProfileConfig {
  name: string;
  avatarUrl: string;
  primaryUrl: string;
  title: LocalizedText;
  heroExtends: LocalizedText;
  biography: LocalizedText;
  location: LocalizedText;
  email?: string | null;
  socialLinks: LinkItem[];
  stats: ProfileStats;
  systemIdentity: SystemIdentityItem[];
  techStack: MetricItem[];
  aiTools: ToolTelemetryItem[];
  careerStartYear: number;
}

export interface SkillEntry {
  name: string;
  level: string;
}

export interface SkillGroup {
  id: string;
  label: LocalizedText;
  items: SkillEntry[];
}

export interface ProjectDetail {
  name: string;
  description: LocalizedText;
  tech: string[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: LocalizedText;
  startDate: string;
  endDate: string;
  location: LocalizedText;
  description: LocalizedLines;
  projects: ProjectDetail[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: LocalizedText;
  field: LocalizedText;
  startDate: string;
  endDate: string;
}

export interface ResumeConfig {
  summary: LocalizedText;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skillGroups: SkillGroup[];
}

export interface GitHubProjectSettings {
  username: string;
  cacheFile: string;
  includeCachedRepos: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: LocalizedText;
  language: string;
  stars: number;
  forks: number;
  url: string;
  homepage?: string | null;
  topics: string[];
  featured: boolean;
  source: string;
  updatedAt?: string | null;
}

export interface ProjectsConfig {
  github: GitHubProjectSettings;
  items: ProjectItem[];
}

export interface MediaAttachment {
  type: 'text' | 'image' | 'audio';
  url: string;
}

export interface PostEntry {
  id: string;
  kind: 'note' | 'article';
  slug: string;
  date: string;
  title: LocalizedText;
  summary: LocalizedText;
  tags: string[];
  body: LocalizedText;
  media?: MediaAttachment | null;
  sourcePath: string;
}

export interface AssistantTarget {
  id: string;
  label: LocalizedText;
}

export interface AssistantConfig {
  title: LocalizedText;
  version: string;
  persona: LocalizedText;
  helpText: LocalizedText;
  bootSequence: Record<LocaleCode, string[]>;
  targets: AssistantTarget[];
  unavailableMessage: LocalizedText;
}

export interface GeneratedMeta {
  generatedAt: string;
  source: string;
  bundleVersion: string;
  warnings: string[];
}

export interface PortfolioBundle {
  site: SiteConfig;
  profile: ProfileConfig;
  resume: ResumeConfig;
  projects: ProjectsConfig;
  posts: PostEntry[];
  assistant: AssistantConfig;
  generated: GeneratedMeta;
}
