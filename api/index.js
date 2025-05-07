// Import required packages
const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Add CORS configuration
app.use(cors({
  origin: 'https://crafu.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
  });
});

// Simplified mock Amazon product endpoint
app.get('/api/amazon-product', async (req, res) => {
  try {
    const productId = req.query.id;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Return mock data for now
    const mockProductData = {
      title: `Amazon Product ${productId}`,
      price: "$29.99",
      image: `https://via.placeholder.com/150?text=Product+${productId}`,
      url: `https://www.amazon.com/dp/${productId}`
    };
    
    return res.json(mockProductData);
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Amazon Product API is running');
});

// Export the Express API
module.exports = app;
