const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Local utils
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

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
exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });

  createSendToken(newUser._id, 201, res, {
    data: {
      user: {
        ...newUser._doc,
        password: undefined,
        __v: undefined
      }
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect user or password', 401));
  }
  createSendToken(user._id, 200, res);
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if token was provided
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
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
  next();
});

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
  const currentUser = await User.findOne({ email: req.body.email });
  if (!currentUser) {
    return next(new AppError('There is no user with this email', 404));
  }

  const resetToken = currentUser.createPasswordResetToken();
  await currentUser.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetToken/${resetToken}`;

  const message = `Forgot your password? Use this link to reset your password:\n ${resetURL}\n If you didn't forget your password, please ignore this message.'`;

  try {
    await sendEmail({
      email: currentUser.email,
      subject: '<Natours> Password Reset',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent to provided email'
    });
  } catch (err) {
    currentUser.resetToken = undefined;
    currentUser.resetTokenExpiration = undefined;
    await currentUser.save({ validateBeforeSave: false });

    return next(
      new AppError('Something went wrong. Please try again later'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Check for valid token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const currentUser = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiration: { $gt: Date.now() }
  });

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
