// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Route for Amazon product information
app.get('/api/amazon-product', async (req, res) => {
  try {
    const productId = req.query.id;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

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
        'Cache-Control': 'max-age=0'
      }
    });

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
    
    // Return the product data
    return res.json({
      title,
      price,
      image,
      url
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch product details',
      message: error.message
    });
  }
});

// Add a simple status route
app.get('/', (req, res) => {
  res.send('Amazon Product API is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the Express API
module.exports = app;
