const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  type: String,
  size: String,
  condition: String,
  tags: [String],
  images: [String],
  status: { type: String, enum: ['available', 'swapped', 'redeemed'], default: 'available' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
  history: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      action: { type: String, enum: ['swapped', 'redeemed'] },
      date: { type: Date, default: Date.now }
    }
  ],
  swapRequests: [
    {
      requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }
  ],
  reservedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
