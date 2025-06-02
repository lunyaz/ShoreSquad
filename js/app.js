// Constants
const API_KEYS = {
    weather: 'YOUR_WEATHER_API_KEY', // TODO: Replace with actual API key
    maps: 'YOUR_MAPS_API_KEY'       // TODO: Replace with actual API key
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
async function fetchWeatherData(latitude, longitude) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEYS.weather}&q=${latitude},${longitude}&days=3`);
        const data = await response.json();
        state.weatherData = data;
        updateWeatherUI();
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherContainer.innerHTML = '<p>Unable to load weather data</p>';
    }
}

function updateWeatherUI() {
    if (!state.weatherData) return;
    
    weatherContainer.innerHTML = `
        <div class="weather-card current">
            <h3>Current Weather</h3>
            <p class="temp">${state.weatherData.current.temp_c}°C</p>
            <p class="condition">${state.weatherData.current.condition.text}</p>
        </div>
    `;
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
    getUserLocation();
    
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
