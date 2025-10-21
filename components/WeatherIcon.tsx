
import React from 'react';
import type { WeatherCondition } from '../types';
import { SunIcon } from './icons/SunIcon';
import { CloudIcon } from './icons/CloudIcon';
import { RainIcon } from './icons/RainIcon';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className }) => {
  const defaultClassName = "w-20 h-20";
  const finalClassName = className || defaultClassName;

  switch (condition) {
    case 'Sunny':
      return <SunIcon className={`${finalClassName} text-yellow-400`} />;
    case 'Cloudy':
    case 'Partly Cloudy':
      return <CloudIcon className={`${finalClassName} text-gray-400`} />;
    case 'Rainy':
      return <RainIcon className={`${finalClassName} text-blue-400`} />;
    default:
      return null;
  }
};
