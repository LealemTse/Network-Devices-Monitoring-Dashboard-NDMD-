const express = require('express');
const router = express.Router()
const { login, getSecurityQuestions, resetPassword, refreshToken } = require('../controllers/authController')

router.post('/login', login)
router.post('/security-questions', getSecurityQuestions)
router.post('/reset-password', resetPassword)
router.post('/refresh-token', refreshToken)

module.exports = router