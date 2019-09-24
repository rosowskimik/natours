/* eslint-disable */
import axios from 'axios';
import showAlert from './alerts';

export const updateData = async data => {
  try {
    axios.patch('/api/v1/users/updateMe', data);
    showAlert('success', 'User updated');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async (
  currentPassword,
  password,
  confirmPassword
) => {
  if (password !== confirmPassword) {
    return showAlert('error', 'Passwords do not match');
  }
  try {
    const res = await axios.patch('/api/v1/users/updatePassword', {
      currentPassword,
      password,
      confirmPassword
    });
    showAlert('success', res.data.message);
    setTimeout(() => location.reload(), 3000);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
