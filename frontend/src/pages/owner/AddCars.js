import React, { useState } from "react";
import { ownerAPI } from '../../services/api';
import "./AddCars.css";

function AddCars({ cars, setCars }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    carModel: "",
    carNumber: "",
    pricePerDay: "",
    carColor: "",
    carYear: "",
    carType: "",
    seats: "",
    fuelType: "Petrol",
    transmission: "Manual",
    location: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addCar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic front-end validation for car number / plate
      if (!formData.carNumber || !formData.carNumber.trim()) {
        setLoading(false);
        const msg = 'Please enter the car number (plate number).';
        setError(msg);
        alert(msg);
        return;
      }

      // Handle image conversion to base64 or use placeholder
      let imageUrl = 'https://via.placeholder.com/400x300?text=Car+Image';
      
      if (formData.image) {
        // Compress and convert image to base64
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              // Create canvas to resize image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Set max dimensions
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 600;
              let width = img.width;
              let height = img.height;
              
              // Calculate new dimensions
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              
              // Convert to base64 with compression
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = e.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.image);
        });
      }

      // Prepare car data for backend
      const carData = {
        name: formData.carModel,
        // Map UI "Car Number" to backend-required plateNumber
        plateNumber: formData.carNumber.trim().toUpperCase(),
        type: formData.carType,
        transmission: formData.transmission,
        fuel: formData.fuelType,
        seats: parseInt(formData.seats),
        price: parseFloat(formData.pricePerDay),
        location: formData.location,
        description: formData.description,
        available: true,
        features: [],
        images: [imageUrl]
      };

      // Add car via API - this will associate it with the logged-in owner
      const response = await ownerAPI.addCar(carData);
      
      console.log('Car added response:', response);
      
      alert("Car added successfully! It will be visible to customers after admin approval.");
      
      // Add to local state
      if (response.data) {
        setCars([...cars, response.data]);
      } else {
        // Refresh cars list to include the newly added car
        window.location.reload();
      }
      
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to add car');
      alert(err.message || 'Failed to add car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      carModel: "",
      carNumber: "",
      pricePerDay: "",
      carColor: "",
      carYear: "",
      carType: "",
      seats: "",
      fuelType: "Petrol",
      transmission: "Manual",
      location: "",
      description: "",
      image: null,
    });
  };

  return (
    <section className="add-cars-section">
      <div className="form-card">
        <h3>Add a New Car</h3>
        <p>Fill in the details below. Your car will be reviewed by admin before appearing to customers.</p>
        
        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={addCar} className="car-form">
          <div className="form-row">
            <div className="form-group">
              <label>Car Model *</label>
              <input
                type="text"
                name="carModel"
                value={formData.carModel}
                onChange={handleChange}
                placeholder="e.g., Toyota Innova"
                required
              />
            </div>
            <div className="form-group">
              <label>Car Number *</label>
              <input
                type="text"
                name="carNumber"
                value={formData.carNumber}
                onChange={handleChange}
                placeholder="e.g., KA01AB1234"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price per Day (₹) *</label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                placeholder="e.g., 1500"
                required
              />
            </div>
            <div className="form-group">
              <label>Car Type *</label>
              <select name="carType" value={formData.carType} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Luxury">Luxury</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="carColor"
                value={formData.carColor}
                onChange={handleChange}
                placeholder="e.g., Red"
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="carYear"
                value={formData.carYear}
                onChange={handleChange}
                placeholder="e.g., 2022"
                min="2000"
                max="2024"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Seats *</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                placeholder="e.g., 5"
                min="2"
                max="8"
                required
              />
            </div>
            <div className="form-group">
              <label>Fuel Type *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Transmission *</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter car description, features, and conditions..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Car Image</label>
            <div className="file-input-container">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="file-input"
              />
              <label className="file-input-label">
                <span>📁 Choose Car Image</span>
                <small>PNG, JPG, JPEG up to 5MB</small>
              </label>
            </div>
            {formData.image && (
              <div className="image-preview">
                <img src={URL.createObjectURL(formData.image)} alt="Preview" />
                <span>{formData.image.name}</span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding Car...' : 'Add Car'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={loading}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddCars;