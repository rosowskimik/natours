/* eslint-disable */
import '@babel/polyfill';
import displayMap from './mapbox';
import signup from './signup';
import { login, logout } from './login';

// DOM elements
const mapbox = document.getElementById('map');
const signupForm = document.querySelector('.form-signup');
const loginForm = document.querySelector('.form-login');
const logoutBtn = document.querySelector('.nav__el--logout');

// Map display
if (mapbox) displayMap(mapbox);
// Signup
if (signupForm) {
  signupForm.addEventListener('submit', event => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    signup(username, email, password, confirmPassword);

    event.preventDefault();
  });
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
