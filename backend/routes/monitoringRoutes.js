const express = require("express")
const router = express.Router()
const { getDevices, receiveMonitoringUpdate, getRefreshInterval, triggerScan } = require('../controllers/monitoringController')

router.get('/all-devices', getDevices)
router.get('/refresh-interval', getRefreshInterval)
router.post('/monitoring-update', receiveMonitoringUpdate)
router.post('/scan', triggerScan)

module.exports = router