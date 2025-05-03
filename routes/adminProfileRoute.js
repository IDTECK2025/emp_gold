const express = require('express');
const router = express.Router();
const authMiddleware = require("../utlis/authMiddleware"); 
const { 
  createShareholderProfile,createUserProfile,universalLogin,
  createCustomerProfile ,createAgentProfile,fetchProfile,createSubagentProfile,
 getProfilesDetails,getDetails
} = require('../controllers/adminProfileCntrl');
const {sendPaymentDetails,sendCusPaymentDetails} = require('../controllers/paymentCntrls');
// routes
router.post('/create-shareholder', authMiddleware, createShareholderProfile);
router.post('/create-customer', authMiddleware, createCustomerProfile);
router.post('/create-agent',authMiddleware,createAgentProfile);
router.post('/create-subagent', authMiddleware, createSubagentProfile);
router.post('/create-user', authMiddleware, createUserProfile);
router.post('/fetch-admin/:userId',fetchProfile);

router.post('/shareholder-login', universalLogin);
router.post('/agent-login', universalLogin);
router.post('/subagent-login', universalLogin);
router.post('/user-login', universalLogin);
router.post('/customer-login', universalLogin);

router.get('/profilesDetails', getProfilesDetails);
router.get('/getdetails', getDetails);
router.post('/process-payment', sendPaymentDetails);
router.post('/process-cus-payment', sendCusPaymentDetails);


module.exports = router;