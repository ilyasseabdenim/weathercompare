import type { WeatherData, WeatherCondition, CitySuggestion } from '../types';

// API Key provided by the user for OpenWeatherMap
const OWM_API_KEY = '10736e77a677bfa81d4afa126abd7bea';

// Base URLs for the APIs
const OWM_GEOCODING_API_BASE = 'https://api.openweathermap.org/geo/1.0/direct';
const OWM_CURRENT_API_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const OM_HISTORICAL_API_BASE = 'https://archive-api.open-meteo.com/v1/archive';

// Fetches a list of city suggestions based on user input
export const getCitySuggestions = async (query: string): Promise<CitySuggestion[]> => {
  if (query.length < 3) return [];
  const url = `${OWM_GEOCODING_API_BASE}?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
    throw new Error(`Failed to fetch city suggestions: ${errorData.message}`);
  }
  const data = await response.json();
  if (!data || data.length === 0) {
    return [];
  }
  // Map the response to our CitySuggestion type
  return data.map((item: any) => ({
    name: item.name,
    country: item.country,
    state: item.state,
    lat: item.lat,
    lon: item.lon,
  }));
};

// Helper to map OpenWeatherMap weather condition codes to our app's conditions
const owmIdToCondition = (id: number): WeatherCondition => {
  // Codes from: https://openweathermap.org/weather-conditions
  if (id >= 200 && id < 600) return 'Rainy';      // Thunderstorm, Drizzle, Rain
  if (id >= 600 && id < 700) return 'Cloudy';     // Snow
  if (id >= 700 && id < 800) return 'Cloudy';     // Atmosphere (mist, fog, etc.)
  if (id === 800) return 'Sunny';                // Clear
  if (id === 801 || id === 802) return 'Partly Cloudy'; // Few / scattered clouds
  if (id === 803 || id === 804) return 'Cloudy'; // Broken / overcast clouds
  return 'Cloudy';
};

// Helper to map WMO weather codes from Open-Meteo to our app's conditions
const wmoCodeToCondition = (code: number): WeatherCondition => {
    // Codes from: https://open-meteo.com/en/docs/dwd-icon-api
    if (code === 0) return 'Sunny';
    if (code >= 1 && code <= 2) return 'Partly Cloudy';
    if (code === 3) return 'Cloudy';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy';
    return 'Cloudy'; // Default for fog, snow, thunderstorms etc.
};

// Fetches current weather data for a specific location
export const getTodaysWeather = async (
    city: string,
    latitude: number,
    longitude: number
): Promise<WeatherData> => {
    const today = new Date();
    const url = `${OWM_CURRENT_API_BASE}?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch current weather data from OpenWeatherMap.');
    const data = await response.json();

    return {
      city,
      date: today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
      year: today.getFullYear(),
      temperature: Math.round(data.main.temp),
      condition: owmIdToCondition(data.weather[0].id),
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert from m/s to km/h
      humidity: Math.round(data.main.humidity),
    };
};


// Fetches historical weather data for the same day for the last 20 years
export const getPastYearsWeather = async (
    city: string,
    latitude: number,
    longitude: number
): Promise<WeatherData[]> => {
    const today = new Date();
    const promises: Promise<WeatherData | null>[] = [];

    for (let i = 1; i <= 20; i++) {
        const pastDate = new Date(today);
        pastDate.setFullYear(today.getFullYear() - i);
        const year = pastDate.getFullYear();
        const dateString = pastDate.toISOString().split('T')[0];

        const promise = (async () => {
            const url = `${OM_HISTORICAL_API_BASE}?latitude=${latitude}&longitude=${longitude}&start_date=${dateString}&end_date=${dateString}&daily=weather_code,temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto`;
            try {
                const response = await fetch(url);
                if (!response.ok) return null; // Silently fail for a single year
                const data = await response.json();
                if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
                    return null;
                }
                const daily = data.daily;
                return {
                    city,
                    date: pastDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
                    year,
                    temperature: Math.round(daily.temperature_2m_max[0]),
                    condition: wmoCodeToCondition(daily.weather_code[0]),
                    windSpeed: Math.round(daily.wind_speed_10m_max[0]),
                    humidity: Math.round(daily.relative_humidity_2m_mean[0]),
                };
            } catch (error) {
                console.warn(`Could not fetch weather for ${year}:`, error);
                return null; // Ignore errors for individual years
            }
        })();
        promises.push(promise);
    }
    
    const results = await Promise.all(promises);
    return results.filter((r): r is WeatherData => r !== null).sort((a, b) => a.year - b.year);
};
