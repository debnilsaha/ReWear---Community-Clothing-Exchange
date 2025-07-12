const router = require('express').Router();
const Item = require('../Models/Item');
const User = require('../Models/User');
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

// Get items uploaded by logged in user
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

// Get all items with filters
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

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('uploader', 'name points');
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Swap Request: user requests to swap for an item
router.post('/:id/swap-request', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    if (item.status !== 'available')
      return res.status(400).json({ msg: 'Item not available for swap' });

    if (item.uploader.toString() === req.user.id)
      return res.status(400).json({ msg: 'Cannot swap your own item' });

    if (item.swapRequest && item.swapRequest.status === 'pending')
      return res.status(400).json({ msg: 'Swap request already pending' });

    item.swapRequest = {
      requester: req.user.id,
      status: 'pending'
    };
    await item.save();

    // In real app, notify uploader here (e.g., email, notification system)

    res.json({ msg: 'Swap request sent' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Uploader approves or rejects swap request
router.post('/:id/swap-response', authMiddleware, async (req, res) => {
  // expects { action: 'approve' | 'reject' }
  const { action } = req.body;
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    if (item.uploader.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Only uploader can respond' });

    if (!item.swapRequest || item.swapRequest.status !== 'pending')
      return res.status(400).json({ msg: 'No pending swap request' });

    if (action === 'approve') {
      item.status = 'swapped';
      item.swapRequest.status = 'approved';
      await item.save();
      res.json({ msg: 'Swap approved' });
    } else if (action === 'reject') {
      item.swapRequest.status = 'rejected';
      await item.save();
      res.json({ msg: 'Swap rejected' });
    } else {
      res.status(400).json({ msg: 'Invalid action' });
    }
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Redeem via points
router.post('/:id/redeem', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('uploader');
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    if (item.status !== 'available')
      return res.status(400).json({ msg: 'Item not available for redemption' });

    if (item.uploader._id.toString() === req.user.id)
      return res.status(400).json({ msg: 'Cannot redeem your own item' });

    // Define point cost for redemption, e.g. 10 points
    const redemptionCost = 10;

    const user = await User.findById(req.user.id);
    if (user.points < redemptionCost)
      return res.status(400).json({ msg: 'Not enough points to redeem' });

    // Deduct points from user and add to uploader
    user.points -= redemptionCost;
    await user.save();

    item.uploader.points += redemptionCost;
    await item.uploader.save();

    item.status = 'redeemed';
    await item.save();

    res.json({ msg: 'Item redeemed via points' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
