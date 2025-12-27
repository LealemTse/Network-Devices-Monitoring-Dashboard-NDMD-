const express = require('express');
const router = express.Router()
const { getRefreshInterval, updateRefreshInterval } = require('../controllers/configController')
const authMiddleware = require('../middlewares/authMiddleWare')

router.get('/refresh-interval', getRefreshInterval);
router.put('/refresh-interval', authMiddleware, updateRefreshInterval);

module.exports = router