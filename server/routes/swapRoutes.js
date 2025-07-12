const router = require('express').Router();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token invalid' });
    req.user = decoded;
    next();
  });
};

// TEMPORARY dummy data so dashboard works
router.get('/mine', authMiddleware, async (req, res) => {
  res.json([
    {
      _id: '1',
      itemTitle: 'Vintage Denim Jacket',
      otherUserName: 'Alice',
      status: 'pending',
    },
    {
      _id: '2',
      itemTitle: 'Green Silk Scarf',
      otherUserName: 'Bob',
      status: 'completed',
    },
  ]);
});

module.exports = router;
