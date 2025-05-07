const express = require('express');
const cors = require('cors');
const router = express.Router();
const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

// Enable CORS
router.use(cors({
  origin: 'https://crafu.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Create API instance
const api = new ProductAdvertisingAPIv1.DefaultApi();

// Set marketplace
const marketplace = 'www.amazon.com';

router.get('/product', async (req, res) => {
  try {
    const productId = req.query.id;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

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
      Marketplace: marketplace,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'ItemInfo.ByLineInfo'
      ]
    };

    // Make the API call
    const data = await api.getItems(requestParameters, credentials);
    
    // Extract product information
    if (data.ItemsResult && data.ItemsResult.Items && data.ItemsResult.Items.length > 0) {
      const item = data.ItemsResult.Items[0];
      
      const productData = {
        title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Title',
        price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Price unavailable',
        image: item.Images?.Primary?.Large?.URL || '',
        url: item.DetailPageURL || `https://www.amazon.com/dp/${productId}`
      };
      
      return res.json(productData);
    } else {
      return res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch product details',
      message: error.message
    });
  }
});

module.exports = router;
