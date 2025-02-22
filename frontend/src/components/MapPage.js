import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
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
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 bg-white shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Livability Explorer</h1>
            <p>Welcome, {userData.name}! Explore potential living areas.</p>
          </div>
          <button 
            onClick={onReset}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Reset User Data
          </button>
        </div>
        
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer 
            center={currentLocation} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
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
        </div>
      </div>
    </div>
  );
}

export default MapPage;