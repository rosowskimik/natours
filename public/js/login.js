/* eslint-disable */
import axios from 'axios';
import showAlert from './alerts';

export const login = async (email, password) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    await axios.post('/api/v1/users/login', { email, password }, config);
    location.replace('/');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    await axios.get('/api/v1/users/logout');
    location.assign('/');
  } catch (err) {
    showAlert('error', 'There was a problem logging you out. Try again later');
  }
};
