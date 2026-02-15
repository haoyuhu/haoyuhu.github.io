import React from 'react';
import { Star, GitFork, ExternalLink, Box } from 'lucide-react';
import { GitHubRepo } from '../types';
import { LANGUAGE_COLORS } from '../constants';

interface ProjectCardProps {
  repo: GitHubRepo;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ repo }) => {
  const langColor = LANGUAGE_COLORS[repo.language] || '#999';

  return (
    <a 
      href={repo.html_url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block bg-ide-bg p-5 rounded-xl border border-ide-border hover:border-geek-orange transition-all hover:shadow-lg hover:shadow-geek-orange/5 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
            <Box size={18} className="text-ide-text-dim group-hover:text-geek-orange transition-colors" />
            <h3 className="font-bold text-ide-text font-mono group-hover:text-geek-orange transition-colors truncate max-w-[200px]">
            {repo.name}
            </h3>
        </div>
        <ExternalLink size={14} className="text-ide-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <p className="text-sm text-ide-text-dim mb-4 line-clamp-2 flex-grow">
        {repo.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between text-xs font-mono text-ide-text-dim mt-auto">
        <div className="flex items-center gap-4">
          {repo.language && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }}></span>
              {repo.language}
            </div>
          )}
          <div className="flex items-center gap-1 group-hover:text-ide-text transition-colors">
            <Star size={12} />
            {repo.stargazers_count}
          </div>
          <div className="flex items-center gap-1 group-hover:text-ide-text transition-colors">
            <GitFork size={12} />
            {repo.forks_count}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProjectCard;