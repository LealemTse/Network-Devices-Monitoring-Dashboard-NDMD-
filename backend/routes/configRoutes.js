const express = require("express");
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleWare');

router.get('/', authMiddleware, getConfig);
router.put('/', authMiddleware, updateConfig);

module.exports = router;
