const express = require('express');

const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/forgotPassword', viewController.getForgotPassword);
router.get('/resetPassword/:token', viewController.getResetPassword);

router.get('/me', authController.protect, viewController.getAccount);

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get('/signup/:token', viewController.getActivate);

module.exports = router;
