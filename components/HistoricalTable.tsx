
import React from 'react';
import type { WeatherData } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { WindIcon } from './icons/WindIcon';
import { HumidityIcon } from './icons/HumidityIcon';

interface HistoricalTableProps {
  data: WeatherData[];
}

export const HistoricalTable: React.FC<HistoricalTableProps> = ({ data }) => {
  // Get the last 10 years and reverse to show most recent first
  const recentData = data.slice(-10).reverse();

  if (recentData.length === 0) {
    return null; // Don't render if there's no data
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg border border-white/20 mt-8">
      <h3 className="text-xl font-bold mb-4">Recent History (Last 10 Years)</h3>
      <div className="space-y-3">
        {recentData.map((weather) => (
          <div
            key={weather.year}
            className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-2 items-center bg-black/20 p-3 rounded-lg text-sm"
          >
            {/* Year */}
            <div className="font-bold text-base sm:col-span-1">{weather.year}</div>

            {/* Temperature */}
            <div className="font-bold text-lg text-right sm:text-center">
              {weather.temperature}°C
            </div>

            {/* Condition */}
            <div className="flex items-center justify-start sm:justify-center gap-2">
              <WeatherIcon condition={weather.condition} className="w-6 h-6" />
              <span className="hidden sm:inline">{weather.condition}</span>
            </div>

            {/* Wind and Humidity Wrapper */}
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:col-span-2 sm:justify-center sm:items-center sm:gap-4">
              {/* Wind */}
              <div className="flex items-center justify-center gap-1 text-gray-300">
                <WindIcon className="w-4 h-4 text-cyan-300" />
                <span>{weather.windSpeed} km/h</span>
              </div>

              {/* Humidity */}
              <div className="flex items-center justify-center gap-1 text-gray-300">
                <HumidityIcon className="w-4 h-4 text-blue-300" />
                <span>{weather.humidity}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
