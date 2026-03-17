const mongoose = require('mongoose')

const SavedPlaceSchema = new mongoose.Schema({
  osm_id:   { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  category: { type: String, required: true },
  mood:     { type: String, required: true },
  lat:      { type: Number, required: true },
  lon:      { type: Number, required: true },
  address:  { type: String, default: '' },
  rating:   { type: Number, min: 0, max: 5 },
  tags:     [{ type: String }],
  savedAt:  { type: Date, default: Date.now },
})

module.exports = mongoose.model('SavedPlace', SavedPlaceSchema)