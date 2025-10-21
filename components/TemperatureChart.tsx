import React, { useState, useMemo } from 'react';
import type { WeatherData } from '../types';

interface TemperatureChartProps {
  data: WeatherData[];
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 40 };

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; year: number; temp: number } | null>(null);

  const { minTemp, maxTemp, minYear, maxYear } = useMemo(() => {
    if (data.length === 0) return { minTemp: 0, maxTemp: 40, minYear: new Date().getFullYear() - 20, maxYear: new Date().getFullYear() -1 };
    const temps = data.map(d => d.temperature);
    const years = data.map(d => d.year);
    return {
      minTemp: Math.min(...temps) - 5,
      maxTemp: Math.max(...temps) + 5,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    };
  }, [data]);

  const width = 500;
  const height = 300;
  
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const xScale = (year: number) => PADDING.left + ((year - minYear) / (maxYear - minYear)) * chartWidth;
  const yScale = (temp: number) => PADDING.top + chartHeight - ((temp - minTemp) / (maxTemp - minTemp)) * chartHeight;

  const linePath = useMemo(() => {
    if (data.length < 2) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.temperature)}`).join(' ');
  }, [data, minTemp, maxTemp, minYear, maxYear]);

  const yAxisLabels = useMemo(() => {
    const labels = [];
    const step = Math.round((maxTemp - minTemp) / 5);
    if(step < 1) return [];
    for (let i = Math.ceil(minTemp); i <= maxTemp; i += step) {
      labels.push(i);
    }
    return labels;
  }, [minTemp, maxTemp]);

  const xAxisLabels = useMemo(() => {
    const labels = [];
    const yearRange = maxYear - minYear;
    const step = yearRange > 10 ? 5 : 2;
    for (let i = minYear; i <= maxYear; i += 1) {
        if(i % step === 0) labels.push(i);
    }
    return labels;
  }, [minYear, maxYear]);


  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - svgRect.left;
    
    const yearRange = maxYear - minYear;
    const yearAtX = minYear + ( (svgX - PADDING.left) / chartWidth) * yearRange;
    
    const closestPoint = data.reduce((closest, d) => {
        return Math.abs(d.year - yearAtX) < Math.abs(closest.year - yearAtX) ? d : closest;
    });

    setHoveredPoint({
        x: xScale(closestPoint.year),
        y: yScale(closestPoint.temperature),
        year: closestPoint.year,
        temp: closestPoint.temperature
    });
  };

  const handleMouseLeave = () => {
      setHoveredPoint(null);
  };

  return (
    <div className="relative w-full h-full text-xs">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* Y-axis labels and grid lines */}
            {yAxisLabels.map(label => (
                <g key={`y-axis-${label}`}>
                    <text x={PADDING.left - 8} y={yScale(label)} alignmentBaseline="middle" textAnchor="end" fill="#9ca3af">{label}°</text>
                    <line x1={PADDING.left} x2={width - PADDING.right} y1={yScale(label)} y2={yScale(label)} stroke="#4b5563" strokeWidth="0.5" strokeDasharray="2,2"/>
                </g>
            ))}
            
            {/* X-axis labels */}
            {xAxisLabels.map(label => (
                <text key={`x-axis-${label}`} x={xScale(label)} y={height - PADDING.bottom + 15} textAnchor="middle" fill="#9ca3af">{label}</text>
            ))}

             {/* Line Path */}
            <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth="2" strokeLinecap='round' />
             <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
            </defs>

            {/* Hover tooltip */}
            {hoveredPoint && (
                <g>
                    <line x1={hoveredPoint.x} y1={PADDING.top} x2={hoveredPoint.x} y2={height - PADDING.bottom} stroke="#a78bfa" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4" fill="#a78bfa" stroke="#111827" strokeWidth="2"/>
                </g>
            )}
        </svg>

        {hoveredPoint && (
             <div className="absolute bg-gray-900/80 text-white p-2 rounded-md shadow-lg pointer-events-none transition-transform duration-100" 
             style={{
                left: `${(hoveredPoint.x / width * 100)}%`,
                top: `${(hoveredPoint.y / height * 100)}%`,
                transform: `translate(-50%, -120%)`
             }}>
                <div className="font-bold">{hoveredPoint.year}</div>
                <div>{hoveredPoint.temp}°C</div>
            </div>
        )}
    </div>
  );
};
