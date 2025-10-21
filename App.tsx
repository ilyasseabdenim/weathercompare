import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { WeatherData, CitySuggestion } from './types';
import { getTodaysWeather, getPastYearsWeather, getCitySuggestions } from './services/weatherService';
import { WeatherCard } from './components/WeatherCard';
import { TemperatureChart } from './components/TemperatureChart';
import { HistoricalTable } from './components/HistoricalTable';
// FIX: Import AI service and result component.
import { generateTrendAnalysis } from './services/geminiService';
import { ComparisonResult } from './components/ComparisonResult';

const App: React.FC = () => {
  const [cityQuery, setCityQuery] = useState<string>('New York');
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [todayWeather, setTodayWeather] = useState<WeatherData | null>(null);
  const [historicalWeather, setHistoricalWeather] = useState<WeatherData[]>([]);
  // FIX: Add state for AI analysis result.
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
        setSuggestionsError(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCityQuery(query);
    setSelectedCity(null); // Clear selection when user types again
    setSuggestionsError(null);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length > 2) {
      debounceTimeout.current = window.setTimeout(async () => {
        try {
          const results = await getCitySuggestions(query);
          setSuggestions(results);
          if (results.length === 0) {
            setSuggestionsError('No cities found for that query.');
          }
        } catch (err: any) {
          setSuggestions([]);
          setSuggestionsError(err.message || 'Could not fetch suggestions.');
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const displayName = suggestion.state ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}` : `${suggestion.name}, ${suggestion.country}`;
    setCityQuery(displayName);
    setSelectedCity(suggestion);
    setSuggestions([]);
    setSuggestionsError(null);
  };

  const handleCompare = useCallback(async () => {
    if (!selectedCity) {
      setError('Please type a city and select it from the dropdown list.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTodayWeather(null);
    setHistoricalWeather([]);
    // FIX: Reset analysis state on new comparison.
    setAnalysis('');

    try {
      const [todayData, historicalData] = await Promise.all([
        getTodaysWeather(selectedCity.name, selectedCity.lat, selectedCity.lon),
        getPastYearsWeather(selectedCity.name, selectedCity.lat, selectedCity.lon),
      ]);
      
      if (todayData && historicalData.length > 0) {
        setTodayWeather(todayData);
        setHistoricalWeather(historicalData);
        // FIX: Generate AI trend analysis after fetching weather data.
        const analysisText = await generateTrendAnalysis(todayData, historicalData);
        setAnalysis(analysisText);
      } else {
         setError("Could not retrieve enough data to display trends.");
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Weather <span className="text-cyan-400">Rewind</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Compare today's weather with historical data from the last 20 years.
          </p>
        </header>

        <main>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-grow relative" ref={searchContainerRef}>
              <input
                type="text"
                value={cityQuery}
                onChange={handleCityInputChange}
                placeholder="Enter city name (e.g., London)"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow"
                onKeyUp={(e) => e.key === 'Enter' && handleCompare()}
                autoComplete="off"
              />
              {(suggestions.length > 0 || suggestionsError) && (
                <ul className="absolute z-10 w-full bg-gray-800/80 backdrop-blur-md border border-white/20 rounded-lg mt-2 shadow-lg max-h-60 overflow-y-auto">
                  {suggestionsError && <li className="px-4 py-3 text-red-400 italic">{suggestionsError}</li>}
                  {suggestions.map((s, index) => (
                    <li key={`${s.lat}-${s.lon}-${index}`} onClick={() => handleSuggestionClick(s)} className="px-4 py-3 cursor-pointer hover:bg-cyan-500/20 text-gray-200 transition-colors">
                      {s.name}, {s.state && `${s.state}, `}{s.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleCompare}
              disabled={isLoading || !selectedCity}
              className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching Data...
                </>
              ) : 'Compare Weather'}
            </button>
          </div>

          {error && <div className="bg-red-500/50 border border-red-500 text-white px-4 py-3 rounded-lg text-center mb-8">{error}</div>}

          {todayWeather && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                      <WeatherCard title="Today" data={todayWeather} />
                  </div>
                  <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
                      <h3 className="text-xl font-bold mb-4">20-Year Temperature Trend</h3>
                      {historicalWeather.length > 0 ? (
                          <TemperatureChart data={historicalWeather} />
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Not enough historical data to display a chart.</p>
                          </div>
                      )}
                  </div>
              </div>
              <HistoricalTable data={historicalWeather} />
              {/* FIX: Render AI analysis result when available. */}
              {analysis && <ComparisonResult text={analysis} />}
            </>
          )}

          {!isLoading && !todayWeather && (
             <div className="text-center text-gray-400 mt-16">
                <p>Enter a city, select it from the list, and click "Compare Weather" to start.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;