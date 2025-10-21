import { GoogleGenAI } from "@google/genai";
import type { WeatherData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateTrendAnalysis = async (
  todayWeather: WeatherData,
  historicalWeather: WeatherData[]
): Promise<string> => {

  const historicalDataString = historicalWeather
    .map(w => `- ${w.year}: ${w.temperature}°C, ${w.condition}`)
    .join('\n');

  const prompt = `
You are a climatologist AI, skilled at analyzing weather data and identifying long-term trends. Your task is to provide a concise and insightful analysis of the weather for a specific day over the last 20 years.

Here is the data for ${todayWeather.city} on ${todayWeather.date}:

**Today's Weather (${todayWeather.year}):**
- Temperature: ${todayWeather.temperature}°C
- Condition: ${todayWeather.condition}

**Historical Weather Data (Last 20 Years):**
${historicalDataString}

Please provide a summary of the 20-year weather trend. Focus on the following:
1.  **Overall Trend:** Is there a noticeable warming or cooling trend over the past two decades?
2.  **Key Years:** Point out the warmest and coolest years in the dataset.
3.  **General Observation:** Briefly describe the typical weather for this day based on the historical data.
4.  **Tone:** Your analysis should be insightful, clear, and easy for a layperson to understand.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating trend analysis:", error);
    throw new Error("Failed to generate weather trend analysis. Please try again.");
  }
};
