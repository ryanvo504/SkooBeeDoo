import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    if (!formData.age || formData.age < 18 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age between 18 and 120';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(formData));
      // Mark as submitted
      setIsSubmitted(true);
    }
  };

  // If already submitted, show main app
  if (isSubmitted) {
    return (
      <div className="app-container">
        <div className="form-card">
          <div className="submitted-container">
            <svg className="submitted-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1>Welcome Back!</h1>
            <p>You can now access the main application features.</p>
            <button 
              className="reset-button"
              onClick={() => {
                localStorage.removeItem('userData');
                setIsSubmitted(false);
              }}
            >
              Reset User Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landing form
  return (
    <div className="app-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Livability Explorer</h1>
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
              <label htmlFor="age" className="form-label">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="18"
                max="120"
                className={`form-input ${errors.age ? 'error' : ''}`}
              />
              {errors.age && <p className="error-message">{errors.age}</p>}
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