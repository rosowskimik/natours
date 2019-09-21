const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const createSimpleToken = require('../utils/createSimpleToken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please specify an username']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please specify an email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Pasword is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: 'The passwords do not match'
    }
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  resetToken: String,
  resetTokenExpiration: Date,
  confirmToken: String,
  confirmTokenExpiration: Date,
  active: {
    type: Boolean,
    default: false,
    select: false
  }
});

// Document middlewares
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 5000;
  next();
});

// Query middlewares

// Instance methods
userSchema.methods.createEmailConfirmToken = function() {
  const { newToken, hashedToken } = createSimpleToken();

  this.confirmToken = hashedToken;

  this.confirmTokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  return newToken;
};

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const { newToken, hashedToken } = createSimpleToken();

  this.resetToken = hashedToken;

  this.resetTokenExpiration = Date.now() + 10 * 60 * 1000;

  return newToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
