/* eslint-disable */
import axios from 'axios';
import showAlert from './alerts';

export const sendResetRequest = async email => {
  try {
    const res = await axios.post('/api/v1/users/forgotPassword', { email });
    showAlert('success', res.data.message);
    setTimeout(() => location.assign('/'), 3000);
  } catch (err) {
    console.log(err.response);
    showAlert('error', err.response.data.message);
  }
};

export const submitNewPassword = async (
  password,
  confirmPassword,
  resetToken
) => {
  if (password !== confirmPassword) {
    return showAlert('error', 'Passwords do not match');
  }
  try {
    await axios.patch(`/api/v1/users/resetPassword/${resetToken}`, {
      password,
      confirmPassword
    });
    showAlert('success', 'Your password has been reset');
    setTimeout(() => location.assign('/'), 3000);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
