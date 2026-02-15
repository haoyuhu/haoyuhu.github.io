export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
  topics: string[];
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  blog: string;
  twitter_username?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  email?: string;
}

export type PostType = 'note' | 'article';
export type MediaType = 'text' | 'image' | 'audio';

export interface BlogPost {
  id: string;
  title?: string;
  content: string;
  date: string;
  tags: string[];
  postType: PostType;
  mediaType: MediaType;
  mediaUrl?: string;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface ProjectDetail {
  name: string;
  description: string;
  tech: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | 'Present';
  location: string;
  description: string[];
  projects: ProjectDetail[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface AppConfig {
  profile: UserProfile;
  repos: GitHubRepo[];
  blogs: BlogPost[];
  contributions: ContributionDay[];
  experience: Experience[];
  education: Education[];
  generatedAt: string;
}

export interface LanguageStat {
  name: string;
  value: number;
  color: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export enum NavigationTab {
  HOME = 'home.py',
  PROJECTS = 'projects.tsx',
  RESUME = 'cv.json',
  GARDEN = 'garden.log',
  BLOG = 'articles.md',
  SETTINGS = '.env'
}