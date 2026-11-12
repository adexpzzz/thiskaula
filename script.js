/*
 * ClimaNow - Sistema de consulta meteorológica
 * Desenvolvedor 2: JavaScript e integração com API
 * API: Open-Meteo
 */

// Elementos da interface
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const message = document.getElementById("message");

// Traduz os códigos meteorológicos da API
function getWeatherInfo(code) {
    const conditions = {
        0: ["Céu limpo", "☀️"],
        1: ["Predominantemente limpo", "🌤️"],
        2: ["Parcialmente nublado", "⛅"],
        3: ["Nublado", "☁️"],
        45: ["Nevoeiro", "🌫️"],
        48: ["Nevoeiro com geada", "🌫️"],
        51: ["Garoa leve", "🌦️"],
        53: ["Garoa moderada", "🌦️"],
        55: ["Garoa intensa", "🌧️"],
        61: ["Chuva leve", "🌧️"],
        63: ["Chuva moderada", "🌧️"],
        65: ["Chuva forte", "🌧️"],
        71: ["Neve leve", "🌨️"],
        73: ["Neve moderada", "🌨️"],
        75: ["Neve intensa", "❄️"],
        80: ["Pancadas de chuva", "🌦️"],
        81: ["Pancadas moderadas", "🌧️"],
        82: ["Pancadas fortes", "⛈️"],
        95: ["Tempestade", "⛈️"],
        96: ["Tempestade com granizo", "⛈️"],
        99: ["Tempestade forte com granizo", "⛈️"]
    };

    return conditions[code] || ["Condição desconhecida", "🌡️"];
}

// Busca as coordenadas da cidade
async function getCityCoordinates(city) {
    const url = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
    );

    url.search = new URLSearchParams({
        name: city,
        count: "1",
        language: "pt",
        format: "json"
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Não foi possível localizar a cidade.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Cidade não encontrada. Tente novamente.");
    }

    return data.results[0];
}

// Busca os dados meteorológicos
async function getWeather(latitude, longitude) {
    const url = new URL(
        "https://api.open-meteo.com/v1/forecast"
    );

    url.search = new URLSearchParams({
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
        timezone: "auto"
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erro ao consultar os dados meteorológicos.");
    }

    return await response.json();
}

// Atualiza a interface
function updateInterface(city, data) {
    const current = data.current;
    const [weatherDescription, icon] = getWeatherInfo(
        current.weather_code
    );

    cityName.textContent = `${city.name}, ${city.country}`;
    temperature.textContent = `${Math.round(current.temperature_2m)}°`;
    description.textContent = weatherDescription;
    weatherIcon.textContent = icon;

    humidity.textContent = `${current.relative_humidity_2m}%`;
    wind.textContent = `${current.wind_speed_10m} km/h`;
}

// Controla a pesquisa
async function searchWeather(city) {
    if (!city.trim()) {
        message.textContent = "Digite o nome de uma cidade.";
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Buscando...";
    message.textContent = "Consultando informações...";

    try {
        const location = await getCityCoordinates(city);

        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        );

        updateInterface(location, weatherData);

        message.textContent = "Clima atualizado com sucesso!";
    } catch (error) {
        message.textContent = error.message;
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Buscar";
    }
}

// Evento de envio do formulário
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    searchWeather(cityInput.value);
});

// Consulta inicial
searchWeather("São Paulo");