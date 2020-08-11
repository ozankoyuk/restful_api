//collection schema and
//we exported so we could use it at index.js file

const mongoose = require('mongoose');
const Records = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  counts: {
    type: [Number],
    required: true
  },
})
module.exports = mongoose.model('Records', Records);
