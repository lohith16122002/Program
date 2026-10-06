// Weather App JavaScript
// API key (replace with your own if needed)
const API_KEY = "b2f98cc032022a75d63e5b041e5cd8ef";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM elements
const searchBox = document.querySelector('.search input');
const searchBtn = document.querySelector('.search button');
const weatherIcon = document.querySelector('.weather-icon');
const errorDiv = document.querySelector('.error');
const weatherDiv = document.querySelector('.weather');

// Helper to show/hide UI
function showError(show) {
  errorDiv.style.display = show ? 'block' : 'none';
  weatherDiv.style.display = show ? 'none' : 'block';
}

// Fetch weather data for a given city
async function getWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  console.log('Fetching weather:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // e.g., 404 city not found
      console.warn('Response not OK:', response.status);
      showError(true);
      return;
    }
    const data = await response.json();
    console.log('Weather data:', data);
    // Populate UI
    document.querySelector('.city').innerHTML = data.name;
    document.querySelector('.temp').innerHTML = Math.round(data.main.temp) + '°c';
    document.querySelector('.humidity').innerHTML = data.main.humidity + '%';
    document.querySelector('.wind').innerHTML = data.wind.speed + ' km/h';
    // Choose icon based on weather condition
    const condition = data.weather[0].main;
    switch (condition) {
      case 'Clouds':
        weatherIcon.src = 'weather-app-img/images/clouds.png';
        break;
      case 'Clear':
        weatherIcon.src = 'weather-app-img/images/clear.png';
        break;
      case 'Rain':
        weatherIcon.src = 'weather-app-img/images/rain.png';
        break;
      case 'Mist':
        weatherIcon.src = 'weather-app-img/images/mist.png';
        break;
      case 'Drizzle':
        weatherIcon.src = 'weather-app-img/images/drizzle.png';
        break;
      default:
        weatherIcon.src = 'weather-app-img/images/clouds.png';
    }
    showError(false);
  } catch (err) {
    console.error('Fetch error:', err);
    showError(true);
  }
}

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = searchBox.value.trim();
  if (city) getWeather(city);
});

// Load default city on startup
document.addEventListener('DOMContentLoaded', () => {
  getWeather('Bangalore');
});
