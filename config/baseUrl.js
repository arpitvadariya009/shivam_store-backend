// Base URL configuration for file uploads
// Uses environment variables or defaults based on NODE_ENV

const getBaseUrl = () => {
  // Check if BASE_URL is explicitly set in environment
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // In development, use localhost
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return 'http://localhost:5000';
  }
  
  // In production, use the production URL
  return 'https://yummyburp.in';
};

const getUploadsUrl = (filename) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  getBaseUrl,
  getUploadsUrl
};

