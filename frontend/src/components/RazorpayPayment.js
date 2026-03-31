import React, { useEffect, useState } from 'react';
import { paymentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './RazorpayPayment.css';

const RazorpayPayment = ({ bookingId, amount, onSuccess, onFailure, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      toast.error('Failed to load Razorpay. Please check your internet connection.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Razorpay is still loading. Please wait...');
      return;
    }

    console.log('RazorpayPayment: starting payment for booking', bookingId, 'amount', amount);

    // Wait for Razorpay to be available
    let retries = 0;
    while (!window.Razorpay && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      retries++;
    }

    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const orderResponse = await paymentsAPI.createRazorpayOrder(bookingId);
      console.log('RazorpayPayment: orderResponse from server', orderResponse);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const { order } = orderResponse;

      if (!order || !order.id) {
        console.error('RazorpayPayment: invalid order payload', orderResponse);
        throw new Error('Received invalid payment order from server. Please try again later.');
      }
      // Prefer the key from environment, but fall back to this project's test key
      const DEFAULT_RAZORPAY_KEY_ID = 'rzp_test_pTNogpoEY4KvJL';
      const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID || DEFAULT_RAZORPAY_KEY_ID;
      console.log('RazorpayPayment: using Razorpay key id', razorpayKeyId);

      // Get user details from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DriveFlex Car Rental',
        description: `Payment for Booking #${bookingId.substring(0, 8)}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            setLoading(true);
            
            // Verify payment on backend
            const verifyResponse = await paymentsAPI.verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookingId: bookingId
            });

            if (verifyResponse.success) {
              toast.success('Payment successful! Your booking is confirmed.');
              if (onSuccess) {
                onSuccess(verifyResponse.payment);
              }
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
            if (onFailure) {
              onFailure(error);
            }
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#8b5cf6'
        },
        modal: {
          ondismiss: function() {
            if (onClose) {
              onClose();
            }
            setLoading(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(options);
      console.log('RazorpayPayment: opening Razorpay checkout with options', options);
      razorpayInstance.open();
      
      razorpayInstance.on('payment.failed', function (response) {
        const errorMessage = response.error?.description || 'Payment failed. Please try again.';
        toast.error(errorMessage);
        if (onFailure) {
          onFailure(new Error(errorMessage));
        }
        setLoading(false);
      });

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
      if (onFailure) {
        onFailure(error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="razorpay-payment-container">
      <div className="payment-header">
        <h3>Complete Payment</h3>
        <p className="payment-amount">₹{amount.toFixed(2)}</p>
      </div>

      <div className="payment-info">
        <p>You will be redirected to Razorpay secure payment gateway</p>
        <div className="payment-features">
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💳</span>
            <span>Cards, UPI, Wallets</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <span>Instant Confirmation</span>
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded}
          className="btn-pay-now"
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Processing...
            </>
          ) : (
            <>
              <span>💳</span>
              Pay ₹{amount.toFixed(2)}
            </>
          )}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-cancel-payment"
          >
            Cancel
          </button>
        )}
      </div>

      {!razorpayLoaded && (
        <div className="loading-razorpay">
          <p>Loading payment gateway...</p>
        </div>
      )}
    </div>
  );
};

export default RazorpayPayment;

