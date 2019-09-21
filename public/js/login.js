/* eslint-disable */
import axios from 'axios';
import showAlert from './alerts';

const login = async (email, password) => {
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

export default login;
