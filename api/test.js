// api/test.js
module.exports = (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'Unknown'
  });
};
