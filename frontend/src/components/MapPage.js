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

  useEffect(() => {
    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Fetch city scores
    const fetchCityScores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/city-scores');
        const data = await response.json();
        
        const scoresByCity = data.reduce((acc, item) => {
          const key = item.geo_label_citystate;
          if (!acc[key]) {
            acc[key] = {};
          }
          acc[key][item.date_label] = item.Average_General_Score;
          return acc;
        }, {});
        
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
      if (score >= 0.7) color = '#00ff00';
      else if (score >= 0.4) color = '#ffff00';
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
          <h1>Livability Explorer</h1>
          <p>Welcome, {userData?.name}! Explore city livability scores.</p>
        </div>
        
        <div className="controls-container">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-selector"
          >
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
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
                    <p>Livability Score: {cityScores[city][selectedYear].toFixed(2)}</p>
                  ) : (
                    <p>No data available</p>
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