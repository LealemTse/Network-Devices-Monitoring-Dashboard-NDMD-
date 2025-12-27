const express = require('express');
const { getAllLogs, addLog } = require('../controllers/logsController');
const authMiddleware = require('../middlewares/authMiddleWare')
const router = express.Router()

router.get('/', authMiddleware, getAllLogs)
router.post('/', authMiddleware, addLog)

module.exports = router
