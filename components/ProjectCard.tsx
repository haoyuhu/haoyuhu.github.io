import React from 'react';
import { ExternalLink, GitFork, Star, Box } from 'lucide-react';
import { LANGUAGE_COLORS } from '../constants';
import { LocaleCode, ProjectItem } from '../types';
import { getLocalizedText } from '../lib/i18n';

interface ProjectCardProps {
  project: ProjectItem;
  locale: LocaleCode;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, locale }) => {
  const languageColor = LANGUAGE_COLORS[project.language] || LANGUAGE_COLORS.Unknown;

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full rounded-xl border border-ide-border bg-ide-bg p-5 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Box size={18} className="text-ide-text-dim transition-colors group-hover:text-accent" />
          <h3 className="truncate font-mono text-base font-bold text-ide-text transition-colors group-hover:text-accent">
            {project.name}
          </h3>
        </div>
        <ExternalLink size={14} className="shrink-0 text-ide-text-dim opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-3 text-sm leading-6 text-ide-text-dim">
        {getLocalizedText(project.description, locale)}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {project.topics.map((topic) => (
          <span
            key={topic}
            className="rounded border border-ide-border bg-ide-panel px-2 py-1 text-[10px] uppercase tracking-wide text-ide-text-dim"
          >
            #{topic}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between text-xs text-ide-text-dim">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor }} />
            {project.language}
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} />
            {project.stars}
          </div>
          <div className="flex items-center gap-1">
            <GitFork size={12} />
            {project.forks}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProjectCard;
