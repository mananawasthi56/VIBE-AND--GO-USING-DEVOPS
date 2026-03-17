const mongoose = require('mongoose')

const SearchLogSchema = new mongoose.Schema({
  mood:         { type: String, required: true },
  lat:          { type: Number, required: true },
  lon:          { type: Number, required: true },
  city:         { type: String, default: '' },
  resultsCount: { type: Number, default: 0 },
  searchedAt:   { type: Date, default: Date.now },
})

module.exports = mongoose.model('SearchLog', SearchLogSchema)