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

// Add new item (set approved: true)
router.post('/', authMiddleware, upload.array('images'), async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      images: req.files.map((f) => f.path),
      uploader: req.user.id,
      approved: true,
    });
    await item.save();
    res.json(item);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Get all items with filters (only approved)
router.get('/', async (req, res) => {
  try {
    const query = { approved: true };
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

// Admin: Approve item
router.post('/:id/approve', authMiddleware, async (req, res) => {
  // Only allow admin
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    // Award 10 points to uploader
    await User.findByIdAndUpdate(item.uploader, { $inc: { points: 10 } });
    res.json({ msg: 'Item approved', item });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Admin: Reject item
router.post('/:id/reject', authMiddleware, async (req, res) => {
  // Only allow admin
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    res.json({ msg: 'Item rejected and deleted' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Swap Request: user requests to swap for an item (multiple requests supported)
router.post('/:id/swap-request', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    if (item.status !== 'available')
      return res.status(400).json({ msg: 'Item not available for swap' });
    if (item.uploader.toString() === req.user.id)
      return res.status(400).json({ msg: 'Cannot swap your own item' });
    // Check if user already has a pending request
    if (item.swapRequests.some(r => r.requester.toString() === req.user.id && r.status === 'pending'))
      return res.status(400).json({ msg: 'You already have a pending swap request for this item' });
    item.swapRequests.push({ requester: req.user.id, status: 'pending' });
    await item.save();
    res.json({ msg: 'Swap request sent' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// Uploader approves or rejects swap request (by requester id)
router.post('/:id/swap-response', authMiddleware, async (req, res) => {
  // expects { requesterId, action: 'approve' | 'reject' }
  const { requesterId, action } = req.body;
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    if (item.uploader.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Only uploader can respond' });
    const swapReq = item.swapRequests.find(r => r.requester.toString() === requesterId && r.status === 'pending');
    if (!swapReq) return res.status(400).json({ msg: 'No pending swap request from this user' });
    if (action === 'approve') {
      item.status = 'swapped';
      swapReq.status = 'approved';
      // Add to history
      item.history.push({ user: requesterId, action: 'swapped' });
      // Add to user swap history
      const User = require('../Models/User');
      await User.findByIdAndUpdate(requesterId, { $push: { swappedItems: item._id }, $inc: { points: 5 } });
      await User.findByIdAndUpdate(item.uploader, { $push: { swappedItems: item._id }, $inc: { points: 5 } });
      await item.save();
      res.json({ msg: 'Swap approved' });
    } else if (action === 'reject') {
      swapReq.status = 'rejected';
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
    const redemptionCost = 15;
    const User = require('../Models/User');
    const user = await User.findById(req.user.id);
    if (user.points < redemptionCost)
      return res.status(400).json({ msg: 'Not enough points to redeem' });
    // Deduct points from user and add to uploader
    user.points -= redemptionCost;
    await user.save();
    item.uploader.points += redemptionCost;
    await item.uploader.save();
    item.status = 'redeemed';
    // Reserve for redeemer
    item.reservedFor = req.user.id;
    // Add to history
    item.history.push({ user: req.user.id, action: 'redeemed' });
    // Add to user redeem history
    user.redeemedItems.push(item._id);
    await user.save();
    await item.save();
    res.json({ msg: 'Item redeemed via points' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
