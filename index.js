// Import required packages
const express = require('express');
const cors = require('cors');
const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

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

// Create PA API instance
const api = new ProductAdvertisingAPIv1.DefaultApi();

// Simple test endpoint to verify API connectivity
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'Unknown'
  });
});

// Route for Amazon product information using PA API
app.get('/api/amazon-product', async (req, res) => {
  try {
    const productId = req.query.id;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Log request details for debugging
    console.log(`Processing request for product ID: ${productId}`);
    console.log(`Request origin: ${req.headers.origin || 'Unknown'}`);

    // Set credentials
    const credentials = new ProductAdvertisingAPIv1.PartnerType(
      process.env.AMAZON_ACCESS_KEY,
      process.env.AMAZON_SECRET_KEY,
      process.env.AMAZON_ASSOCIATE_TAG
    );

    // Create GetItemsRequest
    const requestParameters = {
      ItemIds: [productId],
      PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'ItemInfo.ByLineInfo'
      ]
    };

    // Make the API call
    const data = await api.getItems(requestParameters, credentials);
    
    // Log successful fetch
    console.log('Successfully fetched product from PA API');
    
    // Extract product information
    if (data.ItemsResult && data.ItemsResult.Items && data.ItemsResult.Items.length > 0) {
      const item = data.ItemsResult.Items[0];
      
      const productData = {
        title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Title',
        price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Price unavailable',
        image: item.Images?.Primary?.Large?.URL || '',
        url: item.DetailPageURL || `https://www.amazon.com/dp/${productId}`
      };
      
      // Log what we found
      console.log(`Product info found - Title: ${productData.title.substring(0, 30)}..., Price: ${productData.price}`);
      
      return res.json(productData);
    } else {
      return res.status(404).json({ error: 'Product not found' });
    }
    
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
  res.send('Amazon Product API is running - Using Product Advertising API');
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

// Start the server (for local development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
