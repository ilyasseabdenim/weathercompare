# Weather Rewind

A simple web application to view today's weather for any city and compare it with historical data from the same day over the last 20 years.

<div align="center">
<img width="1200" alt="Weather Rewind Screenshot" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Features

-   **City Search:** Find any city in the world.
-   **Current Weather:** View today's temperature, conditions, wind speed, and humidity.
-   **Historical Data:** See a table of weather data for the same day over the past 10 years.
-   **Temperature Chart:** Visualize the temperature trend over the last 20 years.

## Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) installed on your machine.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <directory-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## How It Works

This application uses two APIs to fetch weather data:

-   [OpenWeatherMap](https://openweathermap.org/api) for geocoding (finding cities) and fetching current weather.
-   [Open-Meteo](https://open-meteo.com/) for historical weather data.

All data is fetched on the client-side. The frontend is built with React, TypeScript, and Tailwind CSS.
