/* eslint-disable */
import '@babel/polyfill';
import displayMap from './mapbox';
import { signup, activateAccount } from './signup';
import { login, logout } from './login';
import { sendResetRequest, submitNewPassword } from './passwords';

// DOM elements
const mapbox = document.getElementById('map');
const signupForm = document.querySelector('.form-signup');
const loginForm = document.querySelector('.form-login');
const forgotForm = document.querySelector('.form-forgot');
const resetForm = document.querySelector('.form-reset');
const logoutBtn = document.querySelector('.nav__el--logout');

// Map display
if (mapbox) displayMap(mapbox);
// Signup
if (signupForm) {
  signupForm.addEventListener('submit', event => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    signup(username, email, password, confirmPassword);

    event.preventDefault();
  });
}
if (document.getElementById('activate')) {
  const token = location.pathname.split('/')[2];
  activateAccount(token);
}
// Login
if (loginForm) {
  loginForm.addEventListener('submit', event => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);

    event.preventDefault();
  });
}
// Logout
if (logoutBtn) logoutBtn.addEventListener('click', event => logout());

// Password reset token reqest
if (forgotForm) {
  forgotForm.addEventListener('submit', event => {
    const email = document.getElementById('email').value;

    sendResetRequest(email);

    event.preventDefault();
  });
}

// Submit new password
if (resetForm) {
  resetForm.addEventListener('submit', event => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    submitNewPassword(
      password,
      confirmPassword,
      location.pathname.split('/')[2]
    );

    event.preventDefault();
  });
}
