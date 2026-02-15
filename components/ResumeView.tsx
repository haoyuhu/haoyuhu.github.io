import React, { useState } from 'react';
import { Briefcase, GraduationCap, GitCommit, Calendar, MapPin } from 'lucide-react';
import { Experience, Education } from '../types';

interface ResumeViewProps {
  experience: Experience[];
  education: Education[];
}

const ResumeView: React.FC<ResumeViewProps> = ({ experience, education }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  if (viewMode === 'json') {
    return (
        <div className="font-mono text-sm overflow-auto">
             <div className="flex justify-end mb-4">
                <button 
                    onClick={() => setViewMode('visual')}
                    className="text-xs border border-ide-border px-2 py-1 rounded hover:bg-ide-sidebar transition-colors"
                >
                    Switch to Visual View
                </button>
            </div>
            <pre className="text-ide-text bg-ide-sidebar p-4 rounded-lg">
                {JSON.stringify({ experience, education }, null, 2)}
            </pre>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex justify-between items-center mb-8 border-b border-ide-border pb-4">
             <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-geek-orange">git</span> log --graph --all
            </h2>
             <button 
                onClick={() => setViewMode('json')}
                className="text-xs font-mono text-ide-text-dim hover:text-geek-orange transition-colors"
            >
                {'{ JSON }'}
            </button>
        </div>

        {/* Experience Section - Git Graph Style */}
        <div className="mb-12 relative">
            <h3 className="text-lg font-bold font-mono mb-6 flex items-center gap-2 text-ide-text">
                <Briefcase size={18} className="text-geek-orange" />
                <span>EXPERIENCE_HISTORY</span>
            </h3>
            
            <div className="pl-2">
                {experience.map((exp, index) => (
                    <div key={exp.id} className="relative pl-8 pb-12 last:pb-0 group">
                        {/* Timeline Line */}
                        <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-ide-border group-last:bg-transparent"></div>
                        {/* Node */}
                        <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 bg-geek-orange z-10"></div>
                        
                        <div className="bg-ide-sidebar p-5 rounded-lg border border-ide-border hover:border-geek-orange/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                <div>
                                    <h4 className="text-lg font-bold text-ide-text">{exp.role}</h4>
                                    <div className="text-geek-orange font-mono font-bold text-sm">@{exp.company}</div>
                                </div>
                                <div className="text-xs font-mono text-ide-text-dim flex flex-col md:items-end mt-2 md:mt-0 gap-1">
                                    <div className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-1 rounded">
                                        <Calendar size={12} />
                                        {exp.startDate} - {exp.endDate}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} />
                                        {exp.location}
                                    </div>
                                </div>
                            </div>
                            
                            <ul className="list-disc list-inside text-sm text-ide-text-dim mb-4 space-y-1 font-sans">
                                {exp.description.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>

                            {/* Work Projects */}
                            {exp.projects.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-ide-border/50">
                                    <div className="text-xs font-bold text-ide-text mb-2 font-mono">RELATED_COMMITS (Projects):</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {exp.projects.map((proj, i) => (
                                            <div key={i} className="bg-white dark:bg-black/20 p-3 rounded border border-ide-border">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <GitCommit size={14} className="text-geek-orange" />
                                                    <span className="font-bold text-sm">{proj.name}</span>
                                                </div>
                                                <p className="text-xs text-ide-text-dim mb-2">{proj.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {proj.tech.map(t => (
                                                        <span key={t} className="text-[10px] bg-ide-sidebar px-1.5 py-0.5 rounded text-ide-text border border-ide-border">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Education Section */}
        <div>
            <h3 className="text-lg font-bold font-mono mb-6 flex items-center gap-2 text-ide-text">
                <GraduationCap size={18} className="text-geek-orange" />
                <span>EDUCATION_LOG</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {education.map((edu) => (
                    <div key={edu.id} className="bg-ide-sidebar p-4 rounded-lg border border-ide-border flex items-start justify-between">
                        <div>
                            <div className="font-bold text-ide-text">{edu.school}</div>
                            <div className="text-sm text-geek-orange">{edu.degree}</div>
                            <div className="text-xs text-ide-text-dim mt-1">{edu.field}</div>
                        </div>
                        <div className="text-xs font-mono bg-white dark:bg-black/20 px-2 py-1 rounded">
                            {edu.startDate} - {edu.endDate}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ResumeView;