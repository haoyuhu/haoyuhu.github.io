import React, { useState } from 'react';
import { Briefcase, Calendar, GraduationCap, MapPin, Sparkles } from 'lucide-react';
import { LocaleCode, ResumeConfig } from '../types';
import { getLocalizedText } from '../lib/i18n';

interface ResumeViewProps {
  resume: ResumeConfig;
  locale: LocaleCode;
}

const ResumeView: React.FC<ResumeViewProps> = ({ resume, locale }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  if (viewMode === 'json') {
    return (
      <div className="font-mono text-sm">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setViewMode('visual')}
            className="rounded border border-ide-border px-3 py-1 text-xs text-ide-text-dim transition-colors hover:bg-ide-panel hover:text-accent"
          >
            Switch to Visual View
          </button>
        </div>
        <pre className="overflow-auto rounded-lg border border-ide-border bg-ide-panel p-4 text-ide-text">
          {JSON.stringify(resume, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8 flex items-center justify-between border-b border-ide-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-ide-text">git log --graph --all</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ide-text-dim">{getLocalizedText(resume.summary, locale)}</p>
        </div>
        <button
          onClick={() => setViewMode('json')}
          className="text-xs font-mono text-ide-text-dim transition-colors hover:text-accent"
        >
          {'{ JSON }'}
        </button>
      </div>

      <div className="mb-12">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-ide-text">
          <Briefcase size={18} className="text-accent" />
          EXPERIENCE_HISTORY
        </h3>
        <div className="space-y-6">
          {resume.experience.map((experience) => (
            <article key={experience.id} className="rounded-lg border border-ide-border bg-ide-panel p-5">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h4 className="text-lg font-bold text-ide-text">{getLocalizedText(experience.role, locale)}</h4>
                  <div className="font-mono text-sm font-bold text-accent">@{experience.company}</div>
                </div>
                <div className="space-y-1 text-xs text-ide-text-dim">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {experience.startDate} - {experience.endDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    {getLocalizedText(experience.location, locale)}
                  </div>
                </div>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-ide-text-dim">
                {experience.description[locale].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {experience.projects.map((project) => (
                  <div key={project.name} className="rounded border border-ide-border bg-ide-bg p-4">
                    <div className="mb-2 font-semibold text-ide-text">{project.name}</div>
                    <p className="mb-3 text-sm leading-6 text-ide-text-dim">{getLocalizedText(project.description, locale)}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span key={tech} className="rounded border border-ide-border bg-ide-panel px-2 py-1 text-[10px] uppercase tracking-wide text-ide-text-dim">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-ide-text">
          <GraduationCap size={18} className="text-accent" />
          EDUCATION_LOG
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {resume.education.map((education) => (
            <div key={education.id} className="rounded-lg border border-ide-border bg-ide-panel p-4">
              <div className="font-bold text-ide-text">{education.school}</div>
              <div className="mt-1 text-sm text-accent">{getLocalizedText(education.degree, locale)}</div>
              <div className="mt-1 text-sm text-ide-text-dim">{getLocalizedText(education.field, locale)}</div>
              <div className="mt-3 text-xs text-ide-text-dim">
                {education.startDate} - {education.endDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-ide-text">
          <Sparkles size={18} className="text-accent" />
          SKILL_GROUPS
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {resume.skillGroups.map((group) => (
            <div key={group.id} className="rounded-lg border border-ide-border bg-ide-panel p-4">
              <div className="mb-3 font-bold text-ide-text">{getLocalizedText(group.label, locale)}</div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded border border-ide-border bg-ide-bg px-3 py-2 text-sm">
                    <span className="text-ide-text">{item.name}</span>
                    <span className="text-ide-text-dim">{item.level}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeView;
