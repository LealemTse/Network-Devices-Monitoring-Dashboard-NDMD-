const express = require("express")
const router = express.Router()
const { getDevices, receiveMonitoringUpdate, getRefreshInterval, triggerScan, getStatusLogs } = require('../controllers/monitoringController')

router.get('/all-devices', getDevices)
router.get('/refresh-interval', getRefreshInterval)
router.get('/status-logs', getStatusLogs)
router.post('/monitoring-update', receiveMonitoringUpdate)
router.post('/scan', triggerScan)

module.exports = router