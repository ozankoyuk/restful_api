//collection schema and
//we exported so we could use it at index.js file

const mongoose = require('mongoose');
const CustomDocument = new mongoose.Schema({
  totalCount: {
    type: Number,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
})
module.exports = mongoose.model('CustomDocument', CustomDocument);
