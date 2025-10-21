
import React from 'react';
import type { WeatherData } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { WindIcon } from './icons/WindIcon';
import { HumidityIcon } from './icons/HumidityIcon';

interface WeatherCardProps {
  title: string;
  data: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ title, data }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg border border-white/20">
      <h3 className="text-xl font-bold text-center mb-4">{title}</h3>
      <p className="text-center text-gray-300 text-sm mb-4">{data.date}</p>
      
      <div className="flex flex-col items-center mb-6">
        <WeatherIcon condition={data.condition} />
        <p className="text-4xl sm:text-5xl font-extrabold mt-2">{data.temperature}°C</p>
        <p className="text-lg text-gray-200">{data.condition}</p>
      </div>

      <div className="flex justify-around text-center">
        <div className="flex flex-col items-center">
          <WindIcon className="w-6 h-6 text-cyan-300 mb-1" />
          <p className="font-bold">{data.windSpeed} km/h</p>
          <p className="text-xs text-gray-300">Wind</p>
        </div>
        <div className="flex flex-col items-center">
          <HumidityIcon className="w-6 h-6 text-blue-300 mb-1" />
          <p className="font-bold">{data.humidity}%</p>
          <p className="text-xs text-gray-300">Humidity</p>
        </div>
      </div>
    </div>
  );
};
