import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { GitHubRepo } from '../types';

interface GitHubStatsProps {
  repos: GitHubRepo[];
}

const GitHubStats: React.FC<GitHubStatsProps> = ({ repos }) => {
  // Mock data derivation for the radar chart based on the "Geek" persona
  // In a real app, this would be calculated from repo topics and languages
  const skillData = [
    { subject: 'Frontend', A: 95, fullMark: 100 },
    { subject: 'Backend', A: 80, fullMark: 100 },
    { subject: 'AI/Agents', A: 90, fullMark: 100 },
    { subject: 'Infra/Ops', A: 70, fullMark: 100 },
    { subject: 'Design', A: 85, fullMark: 100 },
    { subject: 'System', A: 75, fullMark: 100 },
  ];

  // Language breakdown for the linear bars
  const languages = React.useMemo(() => {
     const counts: Record<string, number> = {};
     repos.forEach(r => { if(r.language) counts[r.language] = (counts[r.language] || 0) + 1 });
     const total = Object.values(counts).reduce((a, b) => a + b, 0);
     return Object.entries(counts)
        .map(([name, count]) => ({ name, percentage: Math.round((count/total)*100) }))
        .sort((a,b) => b.percentage - a.percentage)
        .slice(0, 4);
  }, [repos]);

  return (
    <div className="bg-ide-sidebar p-5 rounded-xl border border-ide-border h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 z-10">
        <h3 className="text-xs font-bold font-mono text-ide-text flex items-center gap-2">
            <span className="w-2 h-2 bg-geek-orange rounded-sm animate-pulse"></span>
            CODING_DNA_SEQUENCE
        </h3>
        <span className="text-[10px] text-ide-text-dim">v2.4.0</span>
      </div>

      {/* Content Container: Left/Right Split */}
      <div className="flex-1 flex flex-col md:flex-row items-center min-h-0 gap-6">
        
        {/* Radar Chart Section (Left) */}
        <div className="flex-1 w-full h-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                <PolarGrid stroke="var(--ide-border)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'var(--ide-text-dim)', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                />
                <Radar
                name="Skill Level"
                dataKey="A"
                stroke="#D94D22"
                strokeWidth={2}
                fill="#D94D22"
                fillOpacity={0.2}
                />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--ide-bg)', borderColor: 'var(--ide-border)', color: 'var(--ide-text)', fontSize: '12px' }}
                    itemStyle={{ color: '#D94D22' }}
                />
            </RadarChart>
            </ResponsiveContainer>
        </div>

        {/* Language Progress Bars (Right) */}
        <div className="w-full md:w-[40%] flex flex-col justify-center space-y-3 z-10 bg-ide-bg/50 p-4 rounded border border-ide-border backdrop-blur-sm">
            {languages.map(lang => (
                <div key={lang.name} className="flex items-center gap-2 text-[10px] font-mono">
                    <div className="w-20 text-ide-text-dim truncate">{lang.name}</div>
                    <div className="flex-1 h-1.5 bg-ide-sidebar rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-ide-text" 
                            style={{ width: `${lang.percentage}%` }}
                        ></div>
                    </div>
                    <div className="w-8 text-right text-geek-orange">{lang.percentage}%</div>
                </div>
            ))}
        </div>

      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
         <div className="w-16 h-16 border-r border-t border-ide-text rounded-tr-3xl"></div>
      </div>
    </div>
  );
};

export default GitHubStats;