const express = require('express')
const { getSaved, savePlace, unsavePlace } = require('../controllers/savedController')

const router = express.Router()

// GET /api/saved
router.get('/', getSaved)

// POST /api/saved
router.post('/', savePlace)

// DELETE /api/saved/:id
router.delete('/:id', unsavePlace)

module.exports = router