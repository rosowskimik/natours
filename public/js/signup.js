/* eslint-disable */
import axios from 'axios';
import showAlert from './alerts';

export const signup = async (username, email, password, confirmPassword) => {
  if (password === confirmPassword) {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      await axios.post(
        '/api/v1/users/signup',
        { name: username, email, password, confirmPassword },
        config
      );
      showAlert(
        'success',
        'Confirmation email sent to provided email address. Please check your email'
      );
      setTimeout(() => location.assign('/'), 5000);
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  } else {
    showAlert('error', 'Passwords do not match');
  }
};

export const activateAccount = async token => {
  try {
    await axios.get(`/api/v1/users/signup/${token}`);
    showAlert('success', 'Your account has been activated');
    setTimeout(() => location.assign('/'), 5000);
  } catch (err) {
    showAlert('error', err.response.data.message);
    setTimeout(() => location.replace('/'), 5000);
  }
};
