const express = require('express');
const router = express.Router();
const authMiddleware = require("../utlis/authMiddleware"); 
const Form = require('../models/registerModel.js');

const { register ,verification ,login,adminDetails} = require('../controllers/registerController.js');

router.post("/register", register);
router.post("/verify-otp", verification);
router.post("/login", login);

//login
router.get("/profile", authMiddleware,adminDetails)

module.exports = router;