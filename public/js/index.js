/* eslint-disable */
import '@babel/polyfill';
import displayMap from './mapbox';
import login from './login';

// DOM elements
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// Functions
if (mapbox) displayMap(mapbox);

if (loginForm) {
  loginForm.addEventListener('submit', event => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);

    event.preventDefault();
  });
}
