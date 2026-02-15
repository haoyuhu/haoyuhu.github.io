import fs from 'fs';
import path from 'path';
import process from 'process';

// Configuration
const GITHUB_USERNAME = 'haoyuhu';
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data.json');
const BLOG_DIR = path.join(process.cwd(), 'posts');

// Mock data generation for demonstration
// In a real scenario, this would use 'node-fetch' to call GitHub API
// and 'front-matter' to parse local markdown files.

async function fetchGitHubData() {
  console.log(`Fetching data for ${GITHUB_USERNAME}...`);
  // Simulate API delay
  // const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  // const profile = await response.json();
  
  // Returning structure matching 'types.ts'
  return {
    profile: {
      name: "Haoyu Hu",
      bio: "Frontend Engineer | Open Source Enthusiast | Pixel Art Lover",
      avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4",
      location: "Shanghai, China",
      blog: `https://github.com/${GITHUB_USERNAME}`,
      public_repos: 42,
      followers: 128,
      following: 56,
      created_at: "2018-01-01T00:00:00Z"
    },
    repos: [
      {
        name: "react-cool-library",
        description: "A super cool react library for doing geeky things.",
        language: "TypeScript",
        stargazers_count: 120,
        forks_count: 30,
        html_url: `https://github.com/${GITHUB_USERNAME}/react-cool-library`,
        updated_at: new Date().toISOString(),
        topics: ["react", "frontend"]
      }
    ]
  };
}

function readBlogPosts() {
  console.log('Reading blog posts...');
  // Ensure directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    // Create a dummy post if empty
    fs.writeFileSync(path.join(BLOG_DIR, 'hello.md'), 
`---
date: 2023-10-27
tags: [hello, world]
type: text
---
Hello World! This is an auto-generated blog post.`);
  }

  // Read files (Simulated logic)
  const posts = [];
  const files = fs.readdirSync(BLOG_DIR);
  
  files.forEach((file, index) => {
    if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
        // Simplified parsing (usually use 'gray-matter')
        const parts = content.split('---');
        const body = parts[2] ? parts[2].trim() : content;
        
        posts.push({
            id: `post-${index}`,
            content: body,
            date: new Date().toISOString(),
            tags: ['demo'],
            type: 'text'
        });
    }
  });

  return posts;
}

async function main() {
  try {
    const ghData = await fetchGitHubData();
    const blogData = readBlogPosts();

    const finalData = {
      ...ghData,
      blogs: blogData,
      generatedAt: new Date().toISOString()
    };

    // Ensure public dir
    if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
        fs.mkdirSync(path.join(process.cwd(), 'public'));
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    console.log(`Successfully generated ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Error generating data:", error);
    process.exit(1);
  }
}

main();