/* eslint-disable */
import '@babel/polyfill';
import displayMap from './mapbox';
import { login, logout } from './login';

// DOM elements
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

// Map display
if (mapbox) displayMap(mapbox);
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
