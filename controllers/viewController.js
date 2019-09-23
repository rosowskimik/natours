const Tour = require('../models/tourModel');
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

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Login'
  });
};

exports.getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Create new account'
  });
};

exports.activate = (req, res) => {
  res.status(200).render('activate', {
    title: 'Activate account',
    token: req.params.token
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My account'
  });
};
