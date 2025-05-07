// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Express app
const app = express();

// Add detailed CORS configuration
app.use(cors({
  origin: 'https://crafu.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400  // 24 hours in seconds
}));

// Parse JSON request bodies
app.use(express.json());

// Simple test endpoint to verify API connectivity
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'Unknown'
  });
});

// Route for Amazon product information
app.get('/api/amazon-product', async (req, res) => {
  try {
    const productId = req.query.id;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Log request details for debugging
    console.log(`Processing request for product ID: ${productId}`);
    console.log(`Request origin: ${req.headers.origin || 'Unknown'}`);

    // Construct Amazon URL
    const url = `https://www.amazon.com/dp/${productId}`;
    
    // Make request to Amazon with appropriate headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.amazon.com/'
      },
      timeout: 10000  // 10 seconds timeout
    });

    // Log successful fetch
    console.log('Successfully fetched Amazon page');

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract product information
    const title = $('#productTitle').text().trim();
    
    // Find price - Amazon has different price selectors
    let price = $('.a-price .a-offscreen').first().text().trim();
    if (!price) {
      price = $('#priceblock_ourprice').text().trim();
    }
    if (!price) {
      price = $('#priceblock_dealprice').text().trim();
    }
    
    // Get the main product image
    let image = $('#landingImage').attr('src');
    if (!image) {
      image = $('#imgBlkFront').attr('src');
    }
    if (!image) {
      image = $('.a-dynamic-image').first().attr('src');
    }
    
    // Log what we found
    console.log(`Product info found - Title: ${title.substring(0, 30)}..., Price: ${price}`);
    
    // Return the product data
    return res.json({
      title,
      price,
      image,
      url
    });
    
  } catch (error) {
    console.error('Error fetching product:', error.message);
    
    // Detailed error response
    return res.status(500).json({ 
      error: 'Failed to fetch product details',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add a simple status route
app.get('/', (req, res) => {
  res.send('Amazon Product API is running - CORS Enabled for crafu.github.io');
});

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the Express API for Vercel
module.exports = app;
