const express = require("express")
const router = express.Router()
const { getDevices, receiveMonitoringUpdate, getRefreshInterval } = require('../controllers/monitoringController')

router.get('/all-devices', getDevices)
router.get('/refresh-interval', getRefreshInterval)
router.post('/monitoring-update', receiveMonitoringUpdate)

module.exports = router