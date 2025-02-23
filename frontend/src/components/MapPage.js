import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CITY_COORDINATES } from '../utils/cityCoordinates';
import './MapPage.css';
import FRONTEND_API_BASE_URL from '../API_BASE_URL'

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

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const fetchCityScores = async () => {
      try {
        const response = await fetch("https://skoobeedoo-production.up.railway.app/api/city-scores");
        const data = await response.json();
        
        // Process the data
        const scoresByCity = data.reduce((acc, item) => {
          // Extract just the city name from "City, STATE"
          const cityName = item.geo_label_citystate.split(',')[0].trim();
          
          // Skip the U.S. Total entry
          if (cityName === 'U.S. Total') return acc;
          
          // Find the matching city name in our coordinates
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

    fetchCityScores();
  }, []);

  const createMarkerIcon = (cityName) => {
    const cityData = cityScores[cityName];
    const score = cityData ? cityData[selectedYear] : null;
    
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

  return (
    <div className="map-container">
      <div className="map-header">
        <div className="map-header-content">
          <h1>NextCity Navigator</h1>
          <p>Welcome, {userData?.name}! Explore city livability scores.</p>
        </div>
        
        <div className="controls-container">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-selector"
          >
            <option value="2022">2022</option>
          </select>
          
          <select
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="city-selector"
          >
            <option value="">Choose a City</option>
            {Object.keys(CITY_COORDINATES).sort().map((city) => (
              <option key={city} value={city}>
                {city} {cityScores[city]?.[selectedYear] 
                  ? ` (Score: ${cityScores[city][selectedYear].toFixed(2)})` 
                  : ''}
              </option>
            ))}
          </select>
          
          <button onClick={onReset} className="reset-button">
            Reset User Data
          </button>
        </div>
      </div>

      <div className="map-wrapper">
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

          {Object.entries(CITY_COORDINATES).map(([city, coords]) => (
            <Marker
              key={city}
              position={[coords.lat, coords.lng]}
              icon={createMarkerIcon(city)}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{city}</h3>
                  {cityScores[city]?.[selectedYear] ? (
                    <>
                      <p>Livability Score: {cityScores[city][selectedYear].toFixed(2)}</p>
                      <p>Year: {selectedYear}</p>
                    </>
                  ) : (
                    <p>No data available for {selectedYear}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;