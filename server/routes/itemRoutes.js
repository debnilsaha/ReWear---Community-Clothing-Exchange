const router = require('express').Router();
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
});
const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token invalid' });
    req.user = decoded;
    next();
  });
};

// ✅ Important: define /mine FIRST
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ uploader: req.user.id });
    res.json(items);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Add new item
router.post('/', authMiddleware, upload.array('images'), async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      images: req.files.map((f) => f.path),
      uploader: req.user.id,
    });
    await item.save();
    res.json(item);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.category) query.category = req.query.category;
    if (req.query.size) query.size = req.query.size;
    if (req.query.type) query.type = req.query.type;
    if (req.query.condition) query.condition = req.query.condition;
    if (req.query.tags) query.tags = { $in: req.query.tags.split(',') };

    const items = await Item.find(query).populate('uploader', 'name');
    res.json(items);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// ✅ define this last so it doesn't catch 'mine'
router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id).populate('uploader', 'name');
  res.json(item);
});

module.exports = router;
