// Constants
const API_KEYS = {
    weather: 'YOUR_WEATHER_API_KEY', // TODO: Replace with actual API key
    maps: 'AIzaSyCmEIf8CH8F9KYPcEvatfg52v1B129nzRA'
};

// State management
const state = {
    currentLocation: null,
    weatherData: null,
    cleanupEvents: [],
    userProfile: null
};

// DOM Elements
const mapContainer = document.querySelector('.map-container');
const weatherContainer = document.querySelector('.weather-container');

// Weather functionality
async function fetchWeatherData() {
    try {
        const date = new Date().toISOString().split('T')[0];
        console.log('Fetching weather data for date:', date);
        
        // Fetch both 2-hour and 4-day forecasts
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast'),
            fetch(`https://api.data.gov.sg/v1/environment/4-day-weather-forecast?date=${date}`)
        ]);

        if (!currentResponse.ok) {
            throw new Error(`Current weather API error: ${currentResponse.status}`);
        }
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status}`);
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        console.log('Current weather data:', currentData);
        console.log('Forecast data:', forecastData);

        state.weatherData = {
            current: currentData,
            forecast: forecastData
        };
        
        updateWeatherUI();
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherContainer.innerHTML = '<p>Unable to load weather data</p>';
    }
}

function getWeatherIcon(forecast) {
    // Map NEA weather conditions to icons
    const weatherIcons = {
        // Basic conditions
        'Partly Cloudy': '🌤️',
        'Cloudy': '☁️',
        'Fair': '☀️',
        'Fair & Warm': '☀️',
        'Fair (Night)': '🌙',
        'Partly Cloudy (Night)': '☁️',
        'Windy': '💨',
        
        // Rain conditions
        'Light Rain': '🌦️',
        'Moderate Rain': '🌧️',
        'Heavy Rain': '⛈️',
        'Light Showers': '🌦️',
        'Showers': '🌧️',
        'Heavy Showers': '⛈️',
        
        // Thundery conditions
        'Thundery Showers': '⛈️',
        'Heavy Thundery Showers': '⛈️',
        'Heavy Thundery Showers with Gusty Winds': '⛈️',
        'Morning thundery showers': '⛈️',
        'Afternoon thundery showers': '⛈️',
        'Late morning and early afternoon thundery showers': '⛈️',
        'Pre-dawn and early morning thundery showers': '⛈️',
        
        // Time-specific conditions
        'Late morning and early afternoon showers': '🌧️',
        'Pre-dawn and early morning showers': '🌧️',
        'Early morning and late morning showers': '🌧️',
        'Afternoon showers': '🌧️'
    };
    
    return weatherIcons[forecast] || '❓';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function updateWeatherUI() {
    if (!state.weatherData) return;
    
    const { current, forecast } = state.weatherData;
    
    if (!current?.items?.[0]?.forecasts || !forecast?.items?.[0]?.forecasts) {
        console.error('Invalid weather data structure:', state.weatherData);
        weatherContainer.innerHTML = '<p>Weather data temporarily unavailable</p>';
        return;
    }
    
    // Get the current forecast for the east region (Pasir Ris)
    const eastForecast = current.items[0].forecasts.find(
        f => f.area.toLowerCase() === 'pasir ris'
    );

    if (!eastForecast) {
        console.error('Could not find forecast for Pasir Ris');
        return;
    }

    // Create weather cards HTML
    const currentWeatherHTML = `
        <div class="weather-card current">
            <h3>Current Weather</h3>
            <div class="weather-icon">${getWeatherIcon(eastForecast.forecast)}</div>
            <p class="condition">${eastForecast.forecast}</p>
            <p class="location">Pasir Ris</p>
            <p class="update-time">Last updated: ${new Date(current.items[0].timestamp).toLocaleTimeString('en-SG')}</p>
        </div>
    `;

    const forecastHTML = forecast.items[0].forecasts.map(day => `
        <div class="weather-card">
            <h4>${formatDate(day.date)}</h4>
            <div class="weather-icon">${getWeatherIcon(day.forecast)}</div>
            <p class="condition">${day.forecast}</p>
            <p class="temperature">${day.temperature.low}°C - ${day.temperature.high}°C</p>
            <p class="humidity">Humidity: ${day.relative_humidity.low}% - ${day.relative_humidity.high}%</p>
        </div>
    `).join('');

    weatherContainer.innerHTML = currentWeatherHTML + forecastHTML;
}

// Map functionality
function initMap() {
    // TODO: Initialize map with chosen mapping library
    console.log('Map initialization will go here');
}

// Geolocation
function getUserLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                state.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                fetchWeatherData(state.currentLocation.lat, state.currentLocation.lng);
                // Update map when implemented
            },
            error => {
                console.error('Error getting location:', error);
            }
        );
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData(); // Fetch weather data immediately
    
    // Refresh weather data every 5 minutes
    setInterval(fetchWeatherData, 5 * 60 * 1000);
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Animation utilities
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    },
    { threshold: 0.1 }
);

// Apply fade-in animation to sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});
