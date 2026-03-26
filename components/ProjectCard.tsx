import React from 'react';
import { Box, ExternalLink, Eye, GitFork, Globe, Star } from 'lucide-react';
import { LANGUAGE_COLORS } from '../constants';
import { LocaleCode, ProjectItem } from '../types';
import { formatDate, getLocalizedText } from '../lib/i18n';

interface ProjectCardProps {
  project: ProjectItem;
  locale: LocaleCode;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, locale }) => {
  const languageColor = LANGUAGE_COLORS[project.language] || LANGUAGE_COLORS.Unknown;
  const relationshipLabel = project.relationship === 'contributor' ? 'CONTRIBUTOR' : 'OWNER';
  const relationshipTone =
    project.relationship === 'contributor'
      ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-xl border border-ide-border bg-ide-bg p-5 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            {project.pinned && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-300">
                PINNED
              </span>
            )}
            <span
              className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${relationshipTone}`}
            >
              {relationshipLabel}
            </span>
            {project.featured && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                FEATURED
              </span>
            )}
            {project.homepage && (
              <span className="rounded-full border border-ide-border bg-ide-panel px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ide-text-dim">
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Box size={18} className="mt-0.5 shrink-0 text-ide-text-dim transition-colors group-hover:text-accent" />
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-ide-text transition-colors group-hover:text-accent">
                {project.name}
              </h3>
              <div className="mt-1 break-all text-xs text-ide-text-dim">{project.nameWithOwner}</div>
            </div>
          </div>
        </div>

        <ExternalLink size={14} className="shrink-0 text-ide-text-dim opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-3 break-words text-sm leading-6 text-ide-text-dim">
        {getLocalizedText(project.description, locale)}
      </p>

      {project.topics.length > 0 && (
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
      )}

      <div className="mt-auto space-y-3 pt-2 text-xs text-ide-text-dim">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor }} />
            <span>{project.language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} />
            <span>{project.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork size={12} />
            <span>{project.forks}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{project.watchers}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-ide-border pt-3">
          <div className="break-words text-[11px]">
            {project.relationship === 'contributor'
              ? `Contributed with @${project.repositoryOwner}`
              : `Owned by @${project.repositoryOwner}`}
          </div>
          {project.pushedAt && <div className="text-[11px]">Updated {formatDate(project.pushedAt, locale)}</div>}
        </div>

        {project.homepage && (
          <div className="flex items-center gap-1 text-[11px] text-accent">
            <Globe size={11} />
            <span className="break-all">{project.homepage}</span>
          </div>
        )}
      </div>
    </a>
  );
};

export default ProjectCard;
