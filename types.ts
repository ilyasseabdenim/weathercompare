// FIX: Removed self-import of 'WeatherCondition' to resolve declaration conflict.
export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy';

export interface WeatherData {
  city: string;
  date: string;
  year: number;
  temperature: number; // in Celsius
  condition: WeatherCondition;
  windSpeed: number; // in km/h
  humidity: number; // in %
}

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}
