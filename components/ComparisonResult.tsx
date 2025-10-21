import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ComparisonResultProps {
  text: string;
}

export const ComparisonResult: React.FC<ComparisonResultProps> = ({ text }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg border border-white/20 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <SparklesIcon className="w-6 h-6 text-purple-300" />
        <h3 className="text-xl font-bold">AI Trend Analysis</h3>
      </div>
      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
};
