const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Add CORS headers to allow requests from GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://crafu.github.io');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (req, res) => {
  res.send('Star Rewards Card API is running');
});

app.get('/api/amazon-product', async (req, res) => {
  const productId = req.query.id;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }
  
  try {
    // Make a request to Amazon product page
    const response = await axios.get(`https://www.amazon.com/dp/${productId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Parse the HTML response
    const $ = cheerio.load(response.data);
    
    // Extract product details
    const title = $('#productTitle').text().trim();
    const price = $('.a-offscreen').first().text().trim();
    const image = $('#landingImage').attr('src');
    
    res.json({
      title: title || `Amazon Product ${productId}`,
      price: price || 'Price not available',
      image: image || `https://via.placeholder.com/150?text=Product+${productId}`,
      url: `https://www.amazon.com/dp/${productId}`
    });
  } catch (error) {
    console.error('Error fetching Amazon product:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
