const express = require('express');
const { addDevice, addDevice, getAllDevices, getDeviceById, editDevice, deleteDevice } = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleWare')
const router = express.Router()

router.get('/', authMiddleware, getAllDevices)
router.get('/:id', authMiddleware, getDeviceById)
router.post('/', authMiddleware, addDevice)
router.put('/:id', authMiddleware, editDevice)
router.delete('/:id', authMiddleware, deleteDevice)

module.exports = router
