/**
 * Image Utility Functions for Car Rental App
 * Handles various image formats: base64, data URLs, regular URLs, and emoji fallbacks
 */

/**
 * Formats image data into a proper image source URL
 * @param {string} imageData - The image data (base64, URL, or emoji)
 * @returns {string|null} - Formatted image URL or null if emoji/invalid
 */
export const formatImageSrc = (imageData) => {
  if (!imageData) return null;
  
  // Check if it's an emoji (single character or short string)
  if (imageData.length <= 2) return null;
  
  // If it's already a complete data URL
  if (imageData.startsWith('data:image')) {
    return imageData;
  }
  
  // If it's base64 data without the data URL prefix
  // Common base64 image signatures: /9j/ (JPEG), iVBOR (PNG), R0lG (GIF)
  if (imageData.startsWith('/9j/') || 
      imageData.startsWith('iVBOR') || 
      imageData.startsWith('R0lG')) {
    return `data:image/jpeg;base64,${imageData}`;
  }
  
  // If it's a regular URL (http, https, or relative path)
  if (imageData.startsWith('http://') || 
      imageData.startsWith('https://') || 
      imageData.startsWith('/')) {
    return imageData;
  }
  
  // Default: return null for invalid/unknown formats
  return null;
};

/**
 * Checks if the image data is an emoji
 * @param {string} imageData - The image data to check
 * @returns {boolean} - True if it's an emoji, false otherwise
 */
export const isEmoji = (imageData) => {
  return !imageData || imageData.length <= 2;
};

/**
 * Gets a fallback emoji based on car type
 * @param {string} carType - The type of car (Sedan, SUV, etc.)
 * @returns {string} - Appropriate emoji for the car type
 */
export const getCarEmoji = (carType) => {
  const emojiMap = {
    'Sedan': '🚗',
    'SUV': '🚙',
    'Truck': '🚚',
    'Van': '🚐',
    'Sports': '🏎️',
    'Luxury': '🚘',
    'Electric': '⚡',
    'Convertible': '🏎️'
  };
  return emojiMap[carType] || '🚗';
};

/**
 * React component helper to render car image
 * @param {object} props - Component props
 * @param {string} props.imageData - The image data
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - CSS class for the image
 * @param {string} props.fallbackEmoji - Fallback emoji if no image
 * @returns {JSX.Element} - Image or emoji element
 */
export const renderCarImage = ({ 
  imageData, 
  alt = 'Car', 
  className = '', 
  fallbackEmoji = '🚗' 
}) => {
  const imageSrc = formatImageSrc(imageData);
  
  if (!imageSrc || isEmoji(imageData)) {
    return (
      <div className={`car-emoji ${className}`}>
        {imageData && isEmoji(imageData) ? imageData : fallbackEmoji}
      </div>
    );
  }
  
  return (
    <img 
      src={imageSrc} 
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback to emoji if image fails to load
        e.target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = `car-emoji ${className}`;
        fallback.textContent = fallbackEmoji;
        e.target.parentNode.appendChild(fallback);
      }}
    />
  );
};

export default {
  formatImageSrc,
  isEmoji,
  getCarEmoji,
  renderCarImage
};
