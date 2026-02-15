import React, { useState, useEffect } from 'react';
import { Github, MapPin, Users, Settings, Folder, FileCode, FileText, ChevronRight, Menu, X, Terminal as TerminalIcon, Briefcase, Moon, Sun, Monitor, ArrowRight, Calendar, ChevronsDown } from 'lucide-react';
import { DEFAULT_DATA, PixelMascot, LANGUAGE_COLORS } from './constants';
import { AppConfig, NavigationTab, ThemeMode } from './types';
import ProjectCard from './components/ProjectCard';
import BlogCard from './components/BlogCard';
import ResumeView from './components/ResumeView';

const PAGE_SIZE = 10;

const App: React.FC = () => {
  const [data, setData] = useState<AppConfig>(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.HOME);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [textToType, setTextToType] = useState("");
  
  // Pagination State
  const [gardenLimit, setGardenLimit] = useState(PAGE_SIZE);
  const [blogLimit, setBlogLimit] = useState(PAGE_SIZE);
  
  // Theme Management
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: ThemeMode) => {
        if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };
    applyTheme(theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Loading Simulation & Typing Effect
  useEffect(() => {
    const timer = setTimeout(() => {
        setLoading(false);
    }, 800);

    if (!loading) {
        let i = 0;
        const bio = data.profile.bio;
        const typingInterval = setInterval(() => {
            if (i <= bio.length) {
                setTextToType(bio.substring(0, i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30);
        return () => clearInterval(typingInterval);
    }

    return () => clearTimeout(timer);
  }, [loading, data.profile.bio]);

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-geek-orange font-mono">
            <PixelMascot className="w-24 h-24 animate-pulse mb-6 text-geek-orange" />
            <div className="flex items-center gap-2">
                <span className="animate-spin">/</span>
                <span>BOOTING_KERNEL...</span>
            </div>
            <div className="mt-2 text-xs text-stone-500">Mounting /dev/portfolio...</div>
        </div>
    );
  }

  const { profile, repos, blogs, experience, education } = data;

  const latestProject = repos[0];
  const latestNote = blogs.find(b => b.postType === 'note');
  const latestArticle = blogs.find(b => b.postType === 'article');
  const currentJob = experience[0];

  const gardenPosts = blogs.filter(b => b.postType === 'note');
  const articlePosts = blogs.filter(b => b.postType === 'article');
  
  // Derived data for Neofetch
  const topLanguages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))).slice(0, 5).join(', ');
  const uptime = new Date().getFullYear() - new Date(profile.created_at).getFullYear();

  // Custom Data for Spec Card
  const techStack = [
    { name: "Agent Arch", level: 95 },
    { name: "SFT / RLHF", level: 85 },
    { name: "Inference", level: 90 },
    { name: "Full Stack", level: 92 },
  ];

  const aiTools = [
    { name: "Claude Code", time: "1250h", level: "S-Tier" },
    { name: "Trae", time: "340h", level: "A-Tier" },
    { name: "OpenClaw", time: "680h", level: "A-Tier" },
    { name: "Codex", time: "2.1kh", level: "Legacy" },
  ];

  // Sidebar Nav Item Component
  const NavItem = ({ tab, icon: Icon, label, depth = 0 }: { tab: NavigationTab, icon: any, label: string, depth?: number }) => (
    <button 
        onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm font-mono transition-all border-l-2 ${
            activeTab === tab 
            ? 'bg-ide-sidebar border-geek-orange text-ide-text font-bold' 
            : 'border-transparent text-ide-text-dim hover:text-ide-text hover:bg-ide-sidebar'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
    >
        <Icon size={14} className={activeTab === tab ? 'text-geek-orange' : 'text-ide-text-dim'} />
        {label}
    </button>
  );

  return (
    <div className="h-screen w-screen bg-ide-bg flex flex-col overflow-hidden text-ide-text font-mono transition-colors duration-300">
      
      {/* Top Bar (Window Chrome) */}
      <div className="h-10 bg-ide-sidebar border-b border-ide-border flex items-center justify-between px-4 select-none shrink-0 transition-colors z-30">
         <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50"></div>
            </div>
            <span className="ml-4 text-xs text-ide-text-dim hidden sm:block">haoyu-portfolio — -zsh</span>
         </div>
         <div className="text-xs text-ide-text-dim flex items-center gap-4">
             <div className="flex bg-ide-bg rounded p-0.5 border border-ide-border">
                <button onClick={() => setTheme('light')} className={`p-1 rounded ${theme === 'light' ? 'bg-ide-sidebar text-geek-orange' : 'hover:text-ide-text'}`} title="Light Mode"><Sun size={12}/></button>
                <button onClick={() => setTheme('system')} className={`p-1 rounded ${theme === 'system' ? 'bg-ide-sidebar text-geek-orange' : 'hover:text-ide-text'}`} title="System Mode"><Monitor size={12}/></button>
                <button onClick={() => setTheme('dark')} className={`p-1 rounded ${theme === 'dark' ? 'bg-ide-sidebar text-geek-orange' : 'hover:text-ide-text'}`} title="Dark Mode"><Moon size={12}/></button>
             </div>
             <a href={profile.html_url} target="_blank" className="hover:text-geek-orange flex items-center gap-1 transition-colors">
                <Github size={12} /> GitHub
             </a>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar (Explorer) */}
        <aside className={`
            absolute inset-y-0 left-0 z-40 w-64 bg-ide-sidebar border-r border-ide-border transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-3 uppercase text-xs font-bold text-ide-text-dim tracking-wider mb-2 flex justify-between items-center">
                <span>Explorer</span>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-ide-text">
                    <X size={16} />
                </button>
            </div>
            
            <div className="space-y-0.5">
                <div className="px-3 py-1 flex items-center gap-1 text-sm font-bold text-ide-text">
                    <ChevronRight size={14} className="rotate-90 text-ide-text-dim" />
                    <span>PORTFOLIO</span>
                </div>
                
                <NavItem tab={NavigationTab.HOME} icon={FileCode} label="home.py" depth={1} />
                <NavItem tab={NavigationTab.PROJECTS} icon={Folder} label="projects/" depth={1} />
                <NavItem tab={NavigationTab.RESUME} icon={Briefcase} label="cv.json" depth={1} />
                
                <NavItem tab={NavigationTab.GARDEN} icon={TerminalIcon} label="garden.log" depth={1} />
                <NavItem tab={NavigationTab.BLOG} icon={FileText} label="articles.md" depth={1} />
                <NavItem tab={NavigationTab.SETTINGS} icon={Settings} label=".env" depth={1} />
                
                <div className="mt-6 px-3">
                    <div className="text-xs font-bold text-ide-text-dim mb-2 uppercase">External Libs</div>
                    <a href={profile.blog} target="_blank" className="flex items-center gap-2 px-3 py-1.5 text-sm text-ide-text-dim hover:text-geek-orange transition-colors">
                        <Github size={14} /> github.com
                    </a>
                </div>
            </div>

            {/* Bottom Profile Badge in Sidebar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ide-border bg-ide-sidebar transition-colors">
                <div className="flex items-center gap-3">
                    <img src={profile.avatar_url} className="w-8 h-8 rounded pixelated ring-2 ring-ide-border" alt="Avatar" />
                    <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate text-ide-text">{profile.name}</div>
                        <div className="text-[10px] text-ide-text-dim truncate">@{profile.blog.split('/').pop()}</div>
                    </div>
                </div>
            </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main Content Area (Editor) */}
        <main className="flex-1 flex flex-col min-w-0 bg-ide-bg relative transition-colors duration-300">
            
            {/* Tab Bar */}
            <div className="flex items-center bg-ide-sidebar border-b border-ide-border overflow-x-auto scrollbar-hide shrink-0 z-20">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 md:hidden text-ide-text-dim">
                    <Menu size={18} />
                </button>
                {Object.values(NavigationTab).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-4 py-2 text-sm flex items-center gap-2 border-r border-ide-border min-w-max transition-colors
                            ${activeTab === tab ? 'bg-ide-bg text-geek-orange border-t-2 border-t-geek-orange' : 'text-ide-text-dim bg-ide-sidebar hover:bg-ide-bg/50'}
                        `}
                    >
                        <span>{tab}</span>
                        {activeTab === tab && <X size={12} className="hover:text-red-500" />}
                    </button>
                ))}
            </div>

            {/* Breadcrumbs / Path */}
            <div className="px-4 py-1.5 text-xs text-ide-text-dim border-b border-ide-border flex items-center gap-2 bg-ide-bg transition-colors shrink-0">
                <span>portfolio</span>
                <span>&gt;</span>
                <span className="text-ide-text">{activeTab}</span>
                {activeTab === NavigationTab.HOME && <span className="ml-auto text-geek-orange flex items-center gap-1 animate-pulse">● Live Server</span>}
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth" id="scroll-container">
                <div className="max-w-6xl mx-auto pb-10">
                    
                    {/* HOME TAB: Dashboard Style */}
                    {activeTab === NavigationTab.HOME && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* 1. Hero Profile */}
                            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-ide-border border-dashed">
                                <div className="relative group shrink-0">
                                    <img src={profile.avatar_url} className="w-20 h-20 md:w-28 md:h-28 rounded-xl pixelated border-2 border-ide-border shadow-sm ring-4 ring-ide-bg" alt="Profile" />
                                    <div className="absolute -bottom-2 -right-2 bg-ide-bg p-1.5 rounded-lg border border-ide-border shadow-sm">
                                        <PixelMascot className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1 min-w-0">
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ide-text tracking-tight break-words">
                                        <span className="text-geek-orange">class</span> {profile.name} <span className="text-geek-orange">extends</span> <span className="text-ide-text-dim">AgentOrchestrator, AIInfraArchitect</span>
                                    </h1>
                                    <div className="text-ide-text leading-relaxed font-mono text-sm md:text-base bg-ide-sidebar/50 p-3 rounded border border-ide-border">
                                        <span className="text-geek-orange">def init(self):</span><br/>
                                        <span className="text-ide-text-dim pl-4">""" </span>
                                        {textToType}
                                        <span className="animate-cursor-blink inline-block w-2 h-4 bg-geek-orange ml-1 align-middle"></span>
                                        <span className="text-ide-text-dim"> """</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs pt-1 font-bold text-ide-text-dim">
                                        <div className="flex items-center gap-1 bg-ide-sidebar px-2 py-1 rounded"><MapPin size={12} /> "{profile.location}"</div>
                                        <div className="flex items-center gap-1 bg-ide-sidebar px-2 py-1 rounded"><Users size={12} /> {profile.followers} followers</div>
                                        {profile.email && <div className="flex items-center gap-1 bg-ide-sidebar px-2 py-1 rounded">@{profile.email}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* 2. System Info & Career Log (Replaces Heatmap/Stats) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* System Info (Neofetch Style v2) */}
                                <div className="bg-ide-sidebar p-6 border border-ide-border rounded-xl shadow-sm flex flex-col font-mono text-sm overflow-hidden relative group h-[300px] lg:h-auto">
                                    <div className="absolute top-2 right-2 text-xs text-ide-text-dim">neofetch_v2.sh</div>
                                    
                                    <div className="mb-4 text-xs">
                                        <span className="text-geek-orange font-bold">haoyu@portfolio</span>:<span className="text-blue-500">~</span>$ ./display_specs.sh --verbose
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar flex-1">
                                        {/* Left Column: Basic Info & Stack */}
                                        <div className="space-y-4">
                                            {/* Basic Info */}
                                            <div>
                                                <div className="text-[10px] font-bold text-ide-text-dim mb-1 tracking-wider uppercase">### System_Identity</div>
                                                <div className="whitespace-pre text-ide-text text-xs leading-5">
                                                    Host      : <span className="text-geek-orange">github.com/haoyuhu</span>{"\n"}
                                                    Base      : Shanghai, China{"\n"}
                                                    Edu       : SJTU (M.S. CS){"\n"}
                                                    Work      : Tech Giant Corp{"\n"}
                                                    Role      : AI Infra Architect{"\n"}
                                                    Uptime    : {uptime} Years
                                                </div>
                                            </div>

                                            {/* Tech Stack Progress */}
                                            <div>
                                                <div className="text-[10px] font-bold text-ide-text-dim mb-1 tracking-wider uppercase">### Tech_Stack_Metrics</div>
                                                <div className="flex flex-col gap-1">
                                                    {techStack.map(t => (
                                                        <div key={t.name} className="flex items-center text-xs">
                                                            <span className="w-20 shrink-0 opacity-80">{t.name}</span>
                                                            <span className="text-geek-orange mr-2 font-bold tracking-tighter">
                                                                {"[" + "#".repeat(Math.floor(t.level/10)) + ".".repeat(10 - Math.floor(t.level/10)) + "]"}
                                                            </span>
                                                            <span className="opacity-60">{t.level}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: ASCII Table */}
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-ide-text-dim mb-1 tracking-wider uppercase">### AI_Tool_Telemetry</div>
                                            <div className="whitespace-pre text-[11px] overflow-x-auto text-ide-text bg-ide-bg p-2 rounded border border-ide-border custom-scrollbar">
{`+-------------+-------+--------+
| TOOL        | USAGE | RATING |
+-------------+-------+--------+
${aiTools.map(tool => `| ${tool.name.padEnd(11)} | ${tool.time.padEnd(5)} | ${tool.level.padEnd(6)} |`).join('\n')}
+-------------+-------+--------+`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Career Log (File Tree Style) */}
                                <div className="bg-ide-sidebar p-6 border border-ide-border rounded-xl shadow-sm flex flex-col font-mono text-sm overflow-hidden relative h-[300px]">
                                    <div className="absolute top-2 right-2 text-xs text-ide-text-dim">career_log.txt</div>
                                    <div className="text-geek-orange font-bold mb-4 flex items-center gap-2">
                                        <TerminalIcon size={16} />
                                        <span>cat /var/log/career.log</span>
                                    </div>
                                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                        {experience.slice(0, 3).map((exp) => (
                                            <div key={exp.id} className="relative pl-4 border-l-2 border-ide-border hover:border-geek-orange transition-colors group">
                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-ide-border group-hover:bg-geek-orange transition-colors"></div>
                                                <div className="text-xs text-ide-text-dim mb-0.5 flex justify-between">
                                                    <span>{exp.startDate} - {exp.endDate}</span>
                                                    <span className="text-[10px] opacity-50">{exp.location}</span>
                                                </div>
                                                <div className="text-base font-bold text-ide-text group-hover:text-geek-orange transition-colors">{exp.role}</div>
                                                <div className="text-xs text-blue-500 mb-1">@{exp.company}</div>
                                                <div className="text-xs text-ide-text-dim line-clamp-1">
                                                    {exp.description[0]}
                                                </div>
                                            </div>
                                        ))}
                                         <div 
                                            onClick={() => setActiveTab(NavigationTab.RESUME)}
                                            className="relative pl-4 border-l-2 border-ide-border opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
                                         >
                                              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-ide-border"></div>
                                              <div className="text-xs pt-1 flex items-center gap-1 hover:text-geek-orange">
                                                <ChevronsDown size={12} />
                                                View full history in cv.json
                                              </div>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Dashboard Widgets (Bento Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Featured Project Widget */}
                                {latestProject && (
                                    <div 
                                        onClick={() => setActiveTab(NavigationTab.PROJECTS)}
                                        className="group bg-ide-bg p-5 rounded-xl border border-ide-border hover:border-geek-orange cursor-pointer transition-all hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-ide-text-dim uppercase flex items-center gap-1.5"><Folder size={14} className="text-geek-orange"/> Latest Deployment</span>
                                            <ArrowRight size={16} className="text-ide-text-dim group-hover:text-geek-orange transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-bold text-ide-text group-hover:text-geek-orange transition-colors truncate mb-1">{latestProject.name}</h3>
                                        <p className="text-sm text-ide-text-dim line-clamp-2">{latestProject.description}</p>
                                        <div className="mt-4 flex gap-2">
                                             <span className="text-[10px] bg-ide-sidebar px-2 py-0.5 rounded text-ide-text border border-ide-border font-mono">{latestProject.language}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Latest Note Widget */}
                                {latestNote && (
                                    <div 
                                        onClick={() => setActiveTab(NavigationTab.GARDEN)}
                                        className="group bg-ide-bg p-5 rounded-xl border border-ide-border hover:border-geek-orange cursor-pointer transition-all hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-ide-text-dim uppercase flex items-center gap-1.5"><TerminalIcon size={14} className="text-geek-orange"/> Buffer Stream</span>
                                            <ArrowRight size={16} className="text-ide-text-dim group-hover:text-geek-orange transition-colors" />
                                        </div>
                                        <div className="text-sm text-ide-text font-mono line-clamp-3 opacity-80 border-l-2 border-ide-sidebar pl-3 italic">
                                            "{latestNote.content}"
                                        </div>
                                        <div className="mt-4 text-[10px] text-ide-text-dim font-mono">
                                            Last modified: {new Date(latestNote.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Latest Article Widget */}
                                {latestArticle && (
                                    <div 
                                        onClick={() => setActiveTab(NavigationTab.BLOG)}
                                        className="group bg-ide-bg p-5 rounded-xl border border-ide-border hover:border-geek-orange cursor-pointer transition-all hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-ide-text-dim uppercase flex items-center gap-1.5"><FileText size={14} className="text-geek-orange"/> Kernel Log</span>
                                            <ArrowRight size={16} className="text-ide-text-dim group-hover:text-geek-orange transition-colors" />
                                        </div>
                                        <h3 className="text-base font-bold text-ide-text group-hover:text-geek-orange transition-colors mb-2">{latestArticle.title || 'Untitled Post'}</h3>
                                        <div className="flex gap-1 flex-wrap">
                                            {latestArticle.tags.map(t => (
                                                <span key={t} className="text-[10px] text-ide-text bg-ide-sidebar px-1.5 py-0.5 rounded">#{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Current Role Widget */}
                                {currentJob && (
                                    <div 
                                        onClick={() => setActiveTab(NavigationTab.RESUME)}
                                        className="group bg-ide-bg p-5 rounded-xl border border-ide-border hover:border-geek-orange cursor-pointer transition-all hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-ide-text-dim uppercase flex items-center gap-1.5"><Briefcase size={14} className="text-geek-orange"/> Runtime Env</span>
                                            <ArrowRight size={16} className="text-ide-text-dim group-hover:text-geek-orange transition-colors" />
                                        </div>
                                        <h3 className="text-base font-bold text-ide-text">{currentJob.role}</h3>
                                        <p className="text-sm text-ide-text-dim font-mono mt-1">@{currentJob.company}</p>
                                        <div className="mt-3 flex items-center gap-1 text-[10px] text-ide-text-dim">
                                            <Calendar size={10} />
                                            {currentJob.startDate} - {currentJob.endDate}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {/* RESUME TAB */}
                    {activeTab === NavigationTab.RESUME && (
                        <ResumeView experience={experience} education={education} />
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === NavigationTab.PROJECTS && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-geek-orange">def</span> <span className="text-ide-text">get_featured_projects</span>():
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {repos.map((repo) => (
                                    <ProjectCard key={repo.name} repo={repo} />
                                ))}
                            </div>
                            <div className="mt-8 p-4 bg-ide-sidebar border border-dashed border-ide-border rounded text-center text-sm text-ide-text-dim">
                                <span className="text-geek-orange">return</span> all_projects_from_github
                            </div>
                        </div>
                    )}

                    {/* GARDEN (NOTES) TAB - With Infinite Scroll Simulation */}
                    {activeTab === NavigationTab.GARDEN && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative pl-4 md:pl-8">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-ide-border ml-3 md:ml-0"></div>
                            <h2 className="text-xl font-bold mb-6 pl-4 flex items-center gap-2">
                                <span className="text-geek-orange">while</span> <span className="text-ide-text">brain.is_active</span>():
                            </h2>
                            <div className="space-y-4">
                                {gardenPosts.slice(0, gardenLimit).map(post => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                            {gardenPosts.length > gardenLimit && (
                                <div className="pl-4 mt-8">
                                    <button 
                                        onClick={() => setGardenLimit(prev => prev + PAGE_SIZE)}
                                        className="w-full py-2 bg-ide-sidebar border border-ide-border text-ide-text-dim hover:text-geek-orange hover:border-geek-orange rounded font-mono text-sm flex items-center justify-center gap-2 transition-all"
                                    >
                                        <ChevronsDown size={14} />
                                        Load More...
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ARTICLES TAB - With Infinite Scroll Simulation */}
                    {activeTab === NavigationTab.BLOG && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-geek-orange">import</span> knowledge
                            </h2>
                            <div className="space-y-4">
                                {articlePosts.slice(0, blogLimit).map((post, index) => (
                                    <BlogCard 
                                        key={post.id} 
                                        post={post} 
                                        defaultExpanded={index === 0} // Expand the first article by default
                                    />
                                ))}
                            </div>
                            {articlePosts.length > blogLimit && (
                                <div className="mt-8">
                                    <button 
                                        onClick={() => setBlogLimit(prev => prev + PAGE_SIZE)}
                                        className="w-full py-2 bg-ide-sidebar border border-ide-border text-ide-text-dim hover:text-geek-orange hover:border-geek-orange rounded font-mono text-sm flex items-center justify-center gap-2 transition-all"
                                    >
                                        <ChevronsDown size={14} />
                                        Load More...
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === NavigationTab.SETTINGS && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-ide-sidebar p-6 rounded-lg font-mono text-sm shadow-sm border border-ide-border">
                            <div className="mb-4 text-ide-text-dim"># System Configuration</div>
                            <div className="grid grid-cols-[150px_1fr] gap-y-2 text-ide-text">
                                <span className="text-geek-orange">GENERATED_AT</span>
                                <span>= "{data.generatedAt}"</span>
                                
                                <span className="text-geek-orange">THEME_MODE</span>
                                <span>= "{theme}"</span>
                                
                                <span className="text-geek-orange">AI_MODEL</span>
                                <span>= "gemini-3-flash-preview"</span>
                                
                                <span className="text-geek-orange">VERSION</span>
                                <span>= "2.4.0-agent-core"</span>
                            </div>
                            <div className="mt-8 border-t border-ide-border pt-4">
                                <div className="text-ide-text-dim mb-2"># Scripts</div>
                                <div className="bg-ide-bg p-3 rounded border border-ide-border">
                                    <span className="text-purple-400">npm</span> run update-profile
                                    <br/>
                                    <span className="text-purple-400">python</span> generate_static.py
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="h-6 bg-geek-orange text-white text-[10px] flex items-center justify-between px-3 select-none shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <span className="font-bold">NORMAL</span>
                    <span>master*</span>
                    <span>0 errors, 0 warnings</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Ln 42, Col 12</span>
                    <span>UTF-8</span>
                    <span>TypeScript React</span>
                </div>
            </div>

        </main>
      </div>
    </div>
  );
};

export default App;