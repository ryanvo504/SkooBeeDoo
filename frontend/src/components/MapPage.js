import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function MapPage({ onReset }) {
  // Retrieve user data from localStorage
  const [userData, setUserData] = useState(null);
  
  // State for markers
  const [markers, setMarkers] = useState([]);
  
  // State for current location
  const [currentLocation, setCurrentLocation] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          // Default to a central location if geolocation fails
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 }); // New York City
        }
      );
    } else {
      // Default location if geolocation is not supported
      setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  // Handle map click to add markers
  const handleMapClick = (latlng) => {
    setMarkers([...markers, latlng]);
  };

  // Remove a marker
  const removeMarker = (index) => {
    const newMarkers = markers.filter((_, i) => i !== index);
    setMarkers(newMarkers);
  };

  // If user data or current location is not loaded, show a loading state
  if (!userData || !currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="absolute top-0 left-0 w-full p-4 bg-white shadow-md z-1000">
        <h1 className="text-2xl font-bold">Livability Explorer</h1>
        <p>Welcome, {userData.name}! Explore potential living areas.</p>
      </div>
      
      <MapContainer 
        center={currentLocation} 
        zoom={13} 
        style={{ height: '100vh', width: '100%' }}
      >
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Default map layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Current location marker */}
        <Marker position={currentLocation}>
          <Popup>Your Current Location</Popup>
        </Marker>

        {/* Dynamically added markers */}
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

      <div className="absolute bottom-0 left-0 w-full p-4 bg-white shadow-md z-1000">
        <button 
          onClick={onReset}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reset User Data
        </button>
      </div>
    </div>
  );
}

export default MapPage;