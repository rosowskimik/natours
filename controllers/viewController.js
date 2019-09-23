const Tour = require('../models/tourModel');
const { serveTemplate } = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) return next(new AppError('This page does not exist', 404));

  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

exports.getLogin = serveTemplate('login', 'Login');
exports.getSignup = serveTemplate('signup', 'Create new account');
exports.getAccount = serveTemplate('account', 'My account');
exports.getForgotPassword = serveTemplate('forgotPassword', 'Forgot password');
exports.getResetPassword = serveTemplate('resetPassword', 'Password reset');

exports.getActivate = (req, res) => {
  res.status(200).render('activate', {
    title: 'Activate account',
    token: req.params.token
  });
};
