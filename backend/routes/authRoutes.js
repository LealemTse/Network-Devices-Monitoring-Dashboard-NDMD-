const express = require('express');
const router = express.Router()
const { login, forgotPassword, refreshToken } = require('../controllers/authController')

router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/refresh-token', refreshToken)

module.exports = router