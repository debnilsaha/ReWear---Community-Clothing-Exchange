const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Item = require('../models/Item');

const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err || decoded.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    next();
  });
};

router.delete('/item/:id', adminMiddleware, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Item deleted' });
});

module.exports = router;
