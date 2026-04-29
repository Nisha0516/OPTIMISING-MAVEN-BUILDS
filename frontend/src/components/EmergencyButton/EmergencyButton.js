import React, { useState, useEffect, useRef } from 'react';
import { emergencyAPI } from '../../services/api';
import EmergencyModal from './EmergencyModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EmergencyButton.css';

const EmergencyButton = ({ booking }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const watchIdRef = useRef(null);
  const refineTimerRef = useRef(null);

  // Get current location when modal opens
  useEffect(() => {
    if (showModal) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const clearLocationWatch = () => {
    if (watchIdRef.current !== null) {
      try { navigator.geolocation.clearWatch(watchIdRef.current); } catch (_) {}
      watchIdRef.current = null;
    }
    if (refineTimerRef.current) {
      clearTimeout(refineTimerRef.current);
      refineTimerRef.current = null;
    }
  };

  const getCurrentLocation = () => {
    setLocationError(null);
    clearLocationWatch();

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocation({ error: 'Geolocation not supported' });
      return;
    }

    const DESIRED_ACCURACY = 50; // meters
    const HARD_TIMEOUT_MS = 20000;

    // First reading
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const first = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        setLocation(first);
        console.log('✅ Initial location:', first);

        // Refine with watchPosition if accuracy is not good enough
        if (first.accuracy && first.accuracy > DESIRED_ACCURACY) {
          try {
            watchIdRef.current = navigator.geolocation.watchPosition(
              (pos) => {
                const refined = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                  timestamp: new Date().toISOString()
                };
                // Update only if accuracy improves vs previous
                setLocation(prev => {
                  if (!prev || !prev.accuracy || (refined.accuracy || Infinity) < (prev.accuracy || Infinity)) {
                    console.log('🔎 Refined location:', refined);
                    return refined;
                  }
                  return prev;
                });
                if (refined.accuracy && refined.accuracy <= DESIRED_ACCURACY) {
                  clearLocationWatch();
                }
              },
              (err) => {
                console.warn('watchPosition error:', err);
              },
              { enableHighAccuracy: true, maximumAge: 0, timeout: HARD_TIMEOUT_MS }
            );
            // Stop refining after hard timeout
            refineTimerRef.current = setTimeout(() => {
              clearLocationWatch();
            }, HARD_TIMEOUT_MS);
          } catch (e) {
            console.warn('Could not start watchPosition:', e);
          }
        }
      },
      (error) => {
        console.error('Location error:', error);
        const errorMsg = getLocationErrorMessage(error);
        setLocationError(errorMsg);
        setLocation({ error: errorMsg });
      },
      { enableHighAccuracy: true, timeout: HARD_TIMEOUT_MS, maximumAge: 0 }
    );
  };

  const getLocationErrorMessage = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location access.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable.';
      case error.TIMEOUT:
        return 'Location request timed out.';
      default:
        return 'Unknown location error occurred.';
    }
  };

  const handleEmergencyClick = () => {
    console.log('🚨 EMERGENCY BUTTON CLICKED!');
    console.log('Booking:', booking);
    console.log('Opening modal...');
    setShowModal(true);
  };

  const handleEmergencySubmit = async (emergencyType, description, extra = {}) => {
    setLoading(true);

    try {
      // Validate booking exists and has valid ID
      if (!booking || !booking._id) {
        toast.error('Invalid booking. Please ensure you have an active booking.');
        setShowModal(false);
        setLoading(false);
        return;
      }

      // Validate booking ID is not a test ID
      if (booking._id === 'temp-booking-for-testing' || booking._id === 'test') {
        toast.error('Please use a real booking to send emergency alerts.');
        setShowModal(false);
        setLoading(false);
        return;
      }

      console.log('🚨 Sending emergency alert...', {
        bookingId: booking._id,
        type: emergencyType,
        hasLocation: !!location
      });
      
      // Call the API to send the emergency alert
      const response = await emergencyAPI.createEmergency({
        bookingId: booking._id,
        type: emergencyType,
        description: description || '',
        location: location || { error: 'Location unavailable' }
      });
      
      if (response.success) {
        toast.success('🚨 Emergency alert sent! Admin has been notified and will contact you shortly.');
        console.log('✅ Emergency created successfully:', response.emergency);
      } else {
        toast.error(response.message || 'Failed to send emergency alert');
      }
      
      setShowModal(false);
      
      // Reset form
      setLocation(null);
      setLocationError(null);
      
      return response.emergency;
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to send emergency alert. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setLocation(null);
    setLocationError(null);
    clearLocationWatch();
  };

  // Only show emergency button if there's an active booking
  if (!booking) {
    return null;
  }

  console.log('🔍 EmergencyButton rendering...', { booking, showModal });

  return (
    <>
      <button 
        className="emergency-button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEmergencyClick();
        }}
        title="Emergency Assistance - Tap for immediate help"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 99999,
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        <span className="emergency-icon">🚨</span>
        <span className="emergency-text">Emergency</span>
      </button>

      {showModal && (
        <EmergencyModal
          location={location}
          locationError={locationError}
          onSubmit={handleEmergencySubmit}
          onClose={() => {
            setShowModal(false);
            clearLocationWatch();
          }}
          onRetryLocation={getCurrentLocation}
          loading={loading}
          carName={booking?.car?.name || 'your car'}
          bookingId={booking?._id}
        />
      )}
    </>
  );
};

export default EmergencyButton;
