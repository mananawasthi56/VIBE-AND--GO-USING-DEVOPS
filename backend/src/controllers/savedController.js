const SavedPlace = require('../models/SavedPlace')

async function getSaved(_req, res, next) {
  try {
    const places = await SavedPlace.find().sort({ savedAt: -1 })
    res.json(places)
  } catch (err) {
    next(err)
  }
}

async function savePlace(req, res, next) {
  try {
    const place = await SavedPlace.findOneAndUpdate(
      { osm_id: req.body.osm_id },
      req.body,
      { upsert: true, new: true }
    )
    res.status(201).json(place)
  } catch (err) {
    next(err)
  }
}

async function unsavePlace(req, res, next) {
  try {
    await SavedPlace.findOneAndDelete({ osm_id: req.params.id })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { getSaved, savePlace, unsavePlace }