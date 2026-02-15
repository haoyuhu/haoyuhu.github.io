import React, { useMemo } from 'react';
import { ContributionDay } from '../types';

interface ContributionHeatmapProps {
  data: ContributionDay[];
}

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ data }) => {
  const { weeks, maxCount } = useMemo(() => {
    const contributionMap = new Map<string, number>();
    let max = 0;
    data.forEach(d => {
      contributionMap.set(d.date, d.count);
      if (d.count > max) max = d.count;
    });

    const today = new Date();
    const endDate = today;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364); // ~1 year history

    // Align start to the previous Sunday to ensure grid starts nicely
    const startDay = startDate.getDay();
    const alignedStartDate = new Date(startDate);
    alignedStartDate.setDate(startDate.getDate() - startDay);

    const weeks: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];
    let currentDate = new Date(alignedStartDate);

    // Generate full weeks
    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = contributionMap.get(dateStr) || 0;

      currentWeek.push({ date: dateStr, count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      // Safety break to prevent infinite loops in edge cases
      if (weeks.length > 54) break; 
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { weeks, maxCount: max > 0 ? max : 5 };
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'var(--ide-sidebar)';
    const intensity = Math.ceil((count / maxCount) * 4);
    switch (intensity) {
        case 1: return 'rgba(217, 77, 34, 0.3)';
        case 2: return 'rgba(217, 77, 34, 0.5)';
        case 3: return 'rgba(217, 77, 34, 0.7)';
        default: return 'rgba(217, 77, 34, 1)';
    }
  };

  const blockSize = 11;
  const blockMargin = 3;
  const width = weeks.length * (blockSize + blockMargin);
  const height = 7 * (blockSize + blockMargin);

  return (
    <div className="w-full h-full flex flex-col justify-center overflow-hidden">
      <div className="flex-1 w-full overflow-x-auto scrollbar-hide flex items-center justify-start lg:justify-center">
          <svg 
            width="100%" 
            height="100%"
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="xMidYMid meet"
            className="max-h-full"
          >
            {weeks.map((week, weekIndex) => (
                <g key={weekIndex} transform={`translate(${weekIndex * (blockSize + blockMargin)}, 0)`}>
                    {week.map((day, dayIndex) => (
                        <rect
                            key={day.date}
                            y={dayIndex * (blockSize + blockMargin)}
                            width={blockSize}
                            height={blockSize}
                            rx={2}
                            ry={2}
                            fill={getColor(day.count)}
                            className="transition-all cursor-pointer hover:stroke-2 hover:stroke-ide-text"
                        >
                            <title>{`${day.date}: ${day.count} contributions`}</title>
                        </rect>
                    ))}
                </g>
            ))}
          </svg>
      </div>
       <div className="flex items-center justify-center gap-2 text-[10px] text-ide-text-dim mt-2 font-mono w-full">
            <span>Less</span>
            <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-[1px]" style={{background: 'var(--ide-sidebar)'}}></div>
                <div className="w-2.5 h-2.5 rounded-[1px]" style={{background: 'rgba(217, 77, 34, 0.3)'}}></div>
                <div className="w-2.5 h-2.5 rounded-[1px]" style={{background: 'rgba(217, 77, 34, 0.5)'}}></div>
                <div className="w-2.5 h-2.5 rounded-[1px]" style={{background: 'rgba(217, 77, 34, 0.7)'}}></div>
                <div className="w-2.5 h-2.5 rounded-[1px]" style={{background: 'rgba(217, 77, 34, 1)'}}></div>
            </div>
            <span>More</span>
        </div>
    </div>
  );
};

export default ContributionHeatmap;