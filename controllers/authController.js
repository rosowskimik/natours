const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObject');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Searches user based on provided header token
const searchUserByToken = async (token, type) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const searchedUser = await User.findOne({
    [`${type}Token`]: hashedToken,
    [`${type}TokenExpiration`]: { $gt: Date.now() }
  });
  return searchedUser;
};

// Generates new token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Responds with login token
const createSendToken = (id, statusCode, res, data) => {
  const token = signToken(id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res
    .status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      status: 'success',
      token,
      ...data
    });
};

// Controllers
exports.signUp = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body);
  const newUser = await User.create(filteredBody);

  const confirmToken = newUser.createEmailConfirmToken();
  await newUser.save({ validateBeforeSave: false });

  const confirmURL = `${req.protocol}://${req.get(
    'host'
  )}/signup/${confirmToken}`;

  // Send new email
  try {
    await new Email(newUser, confirmURL).sendActivate();
  } catch (err) {
    await newUser.remove();
    return next(
      new AppError(
        'There was an error with creating your account. Please try again later',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: `Activation link sent to provided email`
  });
});

exports.activateAccount = catchAsync(async (req, res, next) => {
  // Search for valid user with provided token
  const newUser = await searchUserByToken(req.params.token, 'confirm');
  if (!newUser) {
    return next(new AppError('Your token is invalid or has expired', 400));
  }

  // Activate user
  newUser.confirmToken = undefined;
  newUser.confirmTokenExpiration = undefined;
  newUser.active = true;
  await newUser.save({ validateBeforeSave: false });

  // Send welcome email
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  // Login user
  createSendToken(newUser._id, 200, res, {
    message: 'Your account has been activated'
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const user = await User.findOne({ email }).select('+password +active');

  if (
    !user ||
    !(await user.correctPassword(password, user.password)) ||
    !user.active
  ) {
    return next(new AppError('Incorrect user or password', 401));
  }
  createSendToken(user._id, 200, res);
});

exports.logout = (req, res) => {
  res
    .cookie('jwt', 'loggedOut', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })
    .status(200)
    .json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // Check if token was provided
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You need to login before you can access this resource', 401)
    );
  }

  // Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // Check if user changed password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401)
    );
  }

  // Pass to next middleware
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // Validate token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // Check if user changed password
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // Pass to next middleware
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You don't have the required permissions to perform this action`,
          403
        )
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findOne({ email: req.body.email }).select(
    '+active'
  );
  if (!currentUser || !currentUser.active) {
    return next(new AppError('There is no user with this email', 404));
  }

  const resetToken = currentUser.createPasswordResetToken();
  await currentUser.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/resetPassword/${resetToken}`;

  // Send email
  await new Email(currentUser, resetURL).sendPasswordReset();

  res.status(200).json({
    status: 'success',
    message: "Password reset email sent to user's email"
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Check for valid token
  const currentUser = await searchUserByToken(req.params.token, 'reset');

  if (!currentUser) {
    return next(new AppError('Your token is invalid or has expired', 400));
  }

  // Set new password
  currentUser.password = req.body.password;
  currentUser.confirmPassword = req.body.confirmPassword;
  currentUser.resetToken = undefined;
  currentUser.resetTokenExpiration = undefined;
  await currentUser.save();

  // Login user
  createSendToken(currentUser._id, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id).select('+password');

  // Check if correct password was provided
  if (
    !(await currentUser.correctPassword(
      req.body.currentPassword,
      currentUser.password
    ))
  ) {
    return next(new AppError('Incorrect password', 401));
  }

  // Update password
  currentUser.password = req.body.password;
  currentUser.confirmPassword = req.body.confirmPassword;
  await currentUser.save();

  // Login with new password
  createSendToken(currentUser._id, 200, res, {
    message: 'Your password has been changed'
  });
});
