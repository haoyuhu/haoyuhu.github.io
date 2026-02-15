import React from 'react';
import { AppConfig, ContributionDay, BlogPost } from './types';

// Generate dummy heatmap data
const generateHeatmapData = (): ContributionDay[] => {
  const data: ContributionDay[] = [];
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.random() > 0.6 ? Math.floor(Math.random() * 8) : 0
    });
  }
  return data.reverse();
};

const generateDummyPosts = (count: number, type: 'note' | 'article'): BlogPost[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${type}-${i}`,
        title: type === 'article' ? `Generated Article #${i+1}: AI Concepts` : undefined,
        content: type === 'article' 
            ? `## Section ${i+1}\n\nThis is a generated article content to test the pagination and lazy loading features. It simulates a long form content block. \n\n\`\`\`python\nprint("Hello World ${i}")\n\`\`\``
            : `This is a generated note #${i+1} to test infinite scroll in the garden section.`,
        date: new Date(Date.now() - i * 86400000).toISOString(),
        tags: ['test', 'generated', type],
        postType: type,
        mediaType: 'text'
    }));
};

export const DEFAULT_DATA: AppConfig = {
  profile: {
    name: "Haoyu Hu",
    bio: "Building intelligent agents and scalable infrastructure for the next generation of AI applications.",
    avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4",
    location: "Shanghai, China",
    blog: "https://github.com/haoyuhu",
    email: "haoyu.hu@example.com",
    public_repos: 42,
    followers: 128,
    following: 56,
    created_at: "2018-01-01T00:00:00Z"
  },
  contributions: generateHeatmapData(),
  repos: [
    {
      name: "react-cool-library",
      description: "High-performance React hooks library for modern web applications.",
      language: "TypeScript",
      stargazers_count: 342,
      forks_count: 45,
      html_url: "https://github.com/haoyuhu",
      updated_at: "2024-03-15T10:00:00Z",
      topics: ["react", "hooks", "frontend"]
    },
    {
      name: "agent-orchestrator",
      description: "A framework for managing multi-agent workflows in production environments.",
      language: "Python",
      stargazers_count: 512,
      forks_count: 80,
      html_url: "https://github.com/haoyuhu",
      updated_at: "2024-03-20T12:00:00Z",
      topics: ["ai", "agents", "python"]
    },
    {
      name: "pixel-art-engine",
      description: "WASM-based pixel art rendering engine for the web.",
      language: "Rust",
      stargazers_count: 215,
      forks_count: 22,
      html_url: "https://github.com/haoyuhu",
      updated_at: "2024-02-01T12:00:00Z",
      topics: ["rust", "wasm", "graphics"]
    },
    {
      name: "terminal-portfolio",
      description: "A highly customizable, terminal-style personal portfolio template.",
      language: "TypeScript",
      stargazers_count: 156,
      forks_count: 34,
      html_url: "https://github.com/haoyuhu",
      updated_at: "2024-01-20T12:00:00Z",
      topics: ["portfolio", "design", "ui"]
    }
  ],
  education: [
    {
      id: "edu1",
      school: "Shanghai Jiao Tong University",
      degree: "Master of Science",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2019"
    },
    {
      id: "edu2",
      school: "Tongji University",
      degree: "Bachelor of Engineering",
      field: "Software Engineering",
      startDate: "2012",
      endDate: "2016"
    }
  ],
  experience: [
    {
      id: "exp1",
      company: "Tech Giant Corp",
      role: "AI Infra Architect",
      startDate: "2021",
      endDate: "Present",
      location: "Shanghai",
      description: [
        "Architecting the inference platform for large language models.",
        "Optimizing GPU utilization and reducing latency by 40%."
      ],
      projects: [
        {
          name: "Model Serving Platform",
          description: "Scalable k8s-based serving layer for LLMs.",
          tech: ["Go", "Kubernetes", "Python"]
        },
        {
          name: "Data Viz Platform",
          description: "Real-time analytics dashboard processing millions of events.",
          tech: ["D3.js", "Canvas", "WebSockets"]
        }
      ]
    },
    {
      id: "exp2",
      company: "Innovative Startup Inc",
      role: "Full Stack Developer",
      startDate: "2019",
      endDate: "2021",
      location: "Hangzhou",
      description: [
        "Developed the MVP from scratch using Next.js and Node.js.",
        "Implemented CI/CD pipelines and automated testing strategies."
      ],
      projects: [
        {
          name: "E-commerce Core",
          description: "Scalable backend services for handling high-concurrency flash sales.",
          tech: ["Node.js", "Redis", "MongoDB"]
        }
      ]
    }
  ],
  blogs: [
    {
      id: "3",
      title: "The Art of Terminal UIs",
      content: "# Why Terminal UIs?\n\nThey are fast, efficient, and make you look cool. \n\n```python\ndef is_cool(ui_type):\n    return ui_type == 'TUI'\n```\n\nI believe that limiting the visual surface area allows us to focus more on the content and logic. This entire portfolio is designed to mimic that feeling while retaining modern web capabilities.",
      date: "2024-03-10T09:00:00Z",
      tags: ["design", "tui", "thoughts"],
      postType: "article",
      mediaType: "text"
    },
    {
      id: "4",
      content: "Recorded a quick demo of the new voice-to-code feature I'm working on. The latency is surprisingly low!",
      date: "2024-03-12T10:15:00Z",
      tags: ["demo", "voice-ai", "wip"],
      postType: "note",
      mediaType: "audio",
      mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    ...generateDummyPosts(15, 'note'), // Generate 15 dummy notes
    ...generateDummyPosts(5, 'article') // Generate 5 dummy articles
  ],
  generatedAt: new Date().toISOString()
};

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Rust: "#DEA584",
  Python: "#3572A5",
  Go: "#00ADD8",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Vue: "#41B883",
  Unknown: "#CCCCCC"
};

export const PixelMascot = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
  >
    {/* Head Outline */}
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" className="text-geek-gray dark:text-zinc-800" stroke="#D94D22" strokeWidth="2" />
    
    {/* Eyes */}
    <rect x="7" y="9" width="3" height="3" fill="#1A1A1A" className="dark:fill-white" />
    <rect x="14" y="9" width="3" height="3" fill="#1A1A1A" className="dark:fill-white" />
    
    {/* Mouth (Smile) */}
    <rect x="9" y="15" width="6" height="1" fill="#1A1A1A" className="dark:fill-white" />
    <rect x="8" y="14" width="1" height="1" fill="#1A1A1A" className="dark:fill-white" />
    <rect x="15" y="14" width="1" height="1" fill="#1A1A1A" className="dark:fill-white" />

    {/* Antenna */}
    <rect x="11" y="1" width="2" height="3" fill="#D94D22" />
    <rect x="10" y="0" width="4" height="1" fill="#D94D22" />
    
    {/* Cheeks */}
    <rect x="5" y="11" width="1" height="2" fill="#FBCA04" opacity="0.5" />
    <rect x="18" y="11" width="1" height="2" fill="#FBCA04" opacity="0.5" />
  </svg>
);