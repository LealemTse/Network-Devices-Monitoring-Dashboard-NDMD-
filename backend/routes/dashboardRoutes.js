const express = require("express")
const router = express.Router()
const { getDeviceStatusSummary, getDashboardOverview, getUptimeSummary } = require('../controllers/dashboardController')
const authMiddleware = require('../middlewares/authMiddleWare')

router.get('/device-summary', authMiddleware, getDeviceStatusSummary)
router.get('/overview', authMiddleware, getDashboardOverview)
router.get('/uptime-summary', authMiddleware, getUptimeSummary)

module.exports = router