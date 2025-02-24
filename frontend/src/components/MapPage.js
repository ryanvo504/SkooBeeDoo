import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CITY_COORDINATES } from '../utils/cityCoordinates';
import './MapPage.css';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage = ({ onReset }) => {
  const [userData, setUserData] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityScores, setCityScores] = useState({});
  const [selectedYear, setSelectedYear] = useState('2022');
  const [forecastData, setForecastData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [topCityAnalysis, setTopCityAnalysis] = useState('');
  const [topCity, setTopCity] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const fetchCityScores = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        const userWeights = storedUserData ? JSON.parse(storedUserData).weights : null;

        const response = await fetch("https://skoobeedoo-production.up.railway.app//api/city-scores", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ weights: userWeights })
        });
        
        const data = await response.json();
        
        const scoresByCity = data.reduce((acc, item) => {
          const cityName = item.geo_label_citystate.split(',')[0].trim();
          
          if (cityName === 'U.S. Total') return acc;
          
          const matchingCity = Object.keys(CITY_COORDINATES).find(
            coordCity => coordCity.toLowerCase() === cityName.toLowerCase()
          );
          
          if (matchingCity) {
            if (!acc[matchingCity]) {
              acc[matchingCity] = {};
            }
            acc[matchingCity][item.date_label] = item.Average_General_Score;
          }
          
          return acc;
        }, {});

        console.log('Processed city scores:', scoresByCity);
        setCityScores(scoresByCity);
      } catch (error) {
        console.error('Error fetching city scores:', error);
      }
    };

    const fetchForecastData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://skoobeedoo-production.up.railway.app//api/city-forecast");
        const data = await response.json();
        console.log('Raw forecast data received:', data);
        
        // Process the data to match city names exactly
        const processedData = {};
        Object.entries(data).forEach(([cityKey, cityData]) => {
          const cityName = cityKey.split(',')[0].trim();
          processedData[cityName] = cityData;
        });
        
        console.log('Processed forecast data:', processedData);
        setForecastData(processedData);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityScores();
    fetchForecastData();
  }, []);

  // Helper function to get the score for a city and year
  const getCityScore = (city, year) => {
    const yearNum = Number(year);
    
    // For historical data (2022)
    if (yearNum === 2022) {
      return cityScores[city]?.[year] || null;
    }
    
    // For forecast data (2023 onwards)
    const forecast = forecastData[city];
    if (forecast) {
      const yearIndex = forecast.years.indexOf(yearNum);
      if (yearIndex !== -1) {
        console.log(`Found forecast for ${city} year ${year} at index ${yearIndex}:`, forecast.forecast[yearIndex]);
        return forecast.forecast[yearIndex];
      }
    }
    
    return null;
  };

  const createMarkerIcon = (cityName) => {
    const score = getCityScore(cityName, selectedYear);
    console.log(`Creating marker for ${cityName}, year ${selectedYear}, score:`, score);
    
    let color = '#808080';
    if (score !== null) {
      if (score >= 0.64) color = '#00ff00';
      else if (score >= 0.31) color = '#ffff00';
      else color = '#ff0000';
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${cityName === selectedCity ? '30px' : '20px'};
          height: ${cityName === selectedCity ? '30px' : '20px'};
          border-radius: 50%;
          background-color: ${color};
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
  };

  const getTopCityAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:5001/api/analyze-top-city", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityScores: Object.entries(cityScores).map(([city, yearScores]) => ({
            geo_label_citystate: city,
            date_label: 2022,
            Average_General_Score: yearScores[2022]
          })),
          userData: userData // This includes gender and ethnicity from localStorage
        })
      });
      
      const data = await response.json();
      if (data.error) {
        console.error('Error getting city analysis:', data.error);
        return;
      }
      
      setTopCityAnalysis(data.response);
      setTopCity(data.top_city);
    } catch (error) {
      console.error('Error fetching top city analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <div className="map-header-content">
          <h1>NextCity Navigator</h1>
          <p>Welcome, {userData?.name}! Explore city livability scores.</p>
          <div className="preferences-summary">
          <div className="top-city-analysis">
            <button 
              onClick={getTopCityAnalysis}
              disabled={isAnalyzing}
              className="analysis-button"
            >
              {isAnalyzing ? 'Analyzing Top City...' : 'Analyze Top City'}
            </button>
            
            {topCityAnalysis && (
              <div className="analysis-content">
                <h4>Groq's livability assessment of {topCity}</h4>
                <p>{topCityAnalysis}</p>
              </div>
            )}
          </div>
            <p>Your Category Preferences:</p>
            <div className="preferences-grid">
              {userData?.weights && Object.entries(userData.weights).map(([category, weight]) => (
                <div key={category} className="preference-item">
                  <span className="category">{category}:</span>
                  <span className="weight">{(weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="controls-container">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-selector"
          >
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          
          <select
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="city-selector"
          >
            <option value="">Choose a City</option>
            {Object.keys(CITY_COORDINATES).sort().map((city) => {
              const score = getCityScore(city, selectedYear);
              return (
                <option key={city} value={city}>
                  {city} {score !== null ? ` (${selectedYear === '2022' ? 'Score' : 'Forecast'}: ${score.toFixed(2)})` : ''}
                </option>
              );
            })}
          </select>
          
          <button onClick={onReset} className="reset-button">
            Reset User Data
          </button>
        </div>
      </div>

      <div className="map-wrapper">
        {isLoading && selectedYear >= 2023 ? (
          <div className="loading-message">Loading forecast data for {selectedYear}...</div>
        ) : (
          <MapContainer 
            center={[39.8283, -98.5795]}
            zoom={4}
            minZoom={3}
            maxZoom={10}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
              const score = getCityScore(city, selectedYear);
              const forecast = forecastData[city];
              const yearNum = Number(selectedYear);
              const yearIndex = forecast?.years.indexOf(yearNum) ?? -1;

              return (
                <Marker
                  key={city}
                  position={[coords.lat, coords.lng]}
                  icon={createMarkerIcon(city)}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{city}</h3>
                      {score !== null ? (
                        <>
                          <p>{yearNum === 2022 ? 'Livability Score' : 'Forecasted Score'}: {score.toFixed(2)}</p>
                          {yearNum > 2022 && forecast && yearIndex !== -1 && (
                            <p>Forecast Range: {forecast.lower_bound[yearIndex].toFixed(2)} - {forecast.upper_bound[yearIndex].toFixed(2)}</p>
                          )}
                          <p>Year: {selectedYear}</p>
                        </>
                      ) : (
                        <p>No data available for {selectedYear}</p>
                      )}
                      <div className="popup-preferences">
                        <p>Your Preferences:</p>
                        <div className="popup-preferences-grid">
                          {userData?.weights && Object.entries(userData.weights).map(([category, weight]) => (
                            <div key={category} className="popup-preference-item">
                              {category}: {(weight * 100).toFixed(0)}%
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;