// Enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://crafu.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

const handler = (req, res) => {
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
};

module.exports = allowCors(handler);
