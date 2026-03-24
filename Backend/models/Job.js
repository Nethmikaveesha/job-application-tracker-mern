const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: String,
  position: String,
  status: { type: String, enum: ['Applied', 'Interview', 'Offer', 'Rejected'], default: 'Applied' },
  dateApplied: { type: Date, default: Date.now },
  notes: String
});

module.exports = mongoose.model('Job', jobSchema);