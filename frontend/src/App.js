import React, { useState } from 'react';
import MapPage from './components/MapPage'; // Adjust the import path as needed
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    ethnicity: ''
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState('form');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.ethnicity) {
      newErrors.ethnicity = 'Please select your ethnicity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(formData));
      // Navigate to map page
      setCurrentPage('map');
    }
  };

  // Check if user data exists on component mount
  React.useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setCurrentPage('map');
    }
  }, []);

  // Reset function
  const handleReset = () => {
    localStorage.removeItem('userData');
    setCurrentPage('form');
  };

  // Render the appropriate page based on current state
  if (currentPage === 'map') {
    return <MapPage onReset={handleReset} />;
  }

  return (
    <div className="app-container">
      <div className="form-card">
        <div className="form-header">
          <h1>NextCity Navigator</h1>
          <p>Tell us about yourself</p>
        </div>
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`form-input ${errors.gender ? 'error' : ''}`}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="error-message">{errors.gender}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="ethnicity" className="form-label">Ethnicity</label>
              <select
                id="ethnicity"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleInputChange}
                className={`form-input ${errors.ethnicity ? 'error' : ''}`}
              >
                <option value="">Select your ethnicity</option>
                <option value="american-indian">American Indian</option>
                <option value="asian-pacific-islander">Asian/Pacific Islander</option>
                <option value="black">Black</option>
                <option value="hispanic">Hispanic</option>
                <option value="white">White</option>
                <option value="other">Other</option>
              </select>
              {errors.ethnicity && <p className="error-message">{errors.ethnicity}</p>}
            </div>

            <button 
              type="submit"
              className="submit-button"
            >
              Continue to Map
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;