import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// City coordinates (you can expand this list)
const CITY_COORDINATES = {
  // Major U.S. Cities
  'New York City': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  
  // Additional Cities
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Columbus': { lat: 39.9612, lng: -82.9988 },
  'Indianapolis': { lat: 39.7684, lng: -86.1581 },
  'Charlotte': { lat: 35.2271, lng: -80.8431 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  
  // More Cities
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'El Paso': { lat: 31.7619, lng: -106.4850 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Portland': { lat: 45.5155, lng: -122.6789 },
  'Oklahoma City': { lat: 35.4676, lng: -97.5164 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Louisville': { lat: 38.2527, lng: -85.7585 },
  'Baltimore': { lat: 39.2904, lng: -76.6122 },
  'Milwaukee': { lat: 43.0389, lng: -87.9065 },
  'Tucson': { lat: 32.2226, lng: -110.9747 },
  'Cleveland': { lat: 41.4993, lng: -81.6944},
  'Kansas City': { lat: 39.0997, lng: -94.5786},
  'Long Beach': { lat: 33.7701, lng: -118.1937},
  'Memphis': { lat: 35.1495, lng: -90.0490},
  'Minneapolis': { lat: 44.9778, lng: -93.2650},
  'Oakland': { lat: 37.8044, lng: -122.2712},
  
};

// Custom marker icons
const createMarkerIcon = (isSelected) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${isSelected ? '30px' : '20px'};
          height: ${isSelected ? '30px' : '20px'};
          border-radius: 50%;
          background-color: ${isSelected ? '#FF4500' : '#4169E1'};
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };
  
  // Fix for default marker icon
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
  
  function MapPage({ onReset }) {
    // Retrieve user data from localStorage
    const [userData, setUserData] = useState(null);
    
    // State for markers
    const [markers, setMarkers] = useState([]);
    
    // State for current location
    const [currentLocation, setCurrentLocation] = useState(null);
  
    // State for selected city
    const [selectedCity, setSelectedCity] = useState('');
  
    // Custom component to handle map navigation
    function MapNavigation({ center }) {
      const map = useMapEvents({
        'load': () => {
          map.flyTo(center, 6);
        }
      });
      return null;
    }
  
    // Load user data on component mount
    useEffect(() => {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
  
      // Default to geographical center of the US
      setCurrentLocation({ lat: 39.8283, lng: -98.5795 });
    }, []);
  
    // Handle city selection
    const handleCitySelect = (cityName) => {
      const cityCoords = CITY_COORDINATES[cityName];
      if (cityCoords) {
        setCurrentLocation(cityCoords);
        setSelectedCity(cityName);
        // Clear previous markers
        setMarkers([]);
      }
    };
  
    // Handle map click to add markers
    const handleMapClick = (latlng) => {
      setMarkers([...markers, latlng]);
    };
  
    // Remove a marker
    const removeMarker = (index) => {
      const newMarkers = markers.filter((_, i) => i !== index);
      setMarkers(newMarkers);
    };
  
    // If user data is not loaded, show a loading state
    if (!userData) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-2xl font-bold">Loading...</div>
        </div>
      );
    }
  
    return (
        <div className="map-container">
    <div className="map-header">
      <div className="map-header-content">
        <h1>Livability Explorer</h1>
        <p>Welcome, {userData.name}! Explore potential living areas.</p>
      </div>
      <div className="reset-button-container">
        <button 
          onClick={onReset}
          className="reset-button"
        >
          Reset User Data
        </button>
      </div>
    </div>
      
          <div className="city-selector">
            <label htmlFor="city-select">Select a City:</label>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
            >
              <option value="">Choose a City</option>
              {Object.keys(CITY_COORDINATES).sort().map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          <div className="p-2 bg-white">
          <div style={{ height: '600px', width: '100%', border: '4px solid black', borderRadius: '8px', overflow: 'hidden' }}>
            {currentLocation && (
              <MapContainer 
                center={[39.8283, -98.5795]} // Geographical center of the contiguous US
                zoom={4} 
                minZoom={3}
                maxZoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <MapNavigation center={[39.8283, -98.5795]} />
                
                {/* Default map layer */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Markers for all cities */}
                {Object.entries(CITY_COORDINATES).map(([city, coords]) => (
                  <Marker
                    key={city}
                    position={coords}
                    icon={createMarkerIcon(city === selectedCity)}
                  >
                    <Popup>{city}</Popup>
                  </Marker>
                ))}

                {/* Dynamically added user markers */}
                {markers.map((marker, index) => (
                  <Marker key={index} position={marker}>
                    <Popup>
                      Marker {index + 1}
                      <button 
                        onClick={() => removeMarker(index)}
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>
        </div>
      );
  }
  
  export default MapPage;