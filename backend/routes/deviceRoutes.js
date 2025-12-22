const express = require('express');
const { addDevice, addDevice, getAllDevices, getDeviceById, editDevice } = require('../controllers/deviceController');
const router = express.Router()

router.get('/', getAllDevices)
router.get('/:id', getDeviceById)
router.post('/', addDevice)
router.put('/:id', editDevice)
router.delete('/:id', addDevice)

module.exports = router