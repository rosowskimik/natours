/* eslint-disable */
const login = async (email, password) => {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  };

  try {
    const res = await fetch('/api/v1/users/login', config);
    const { status } = await res.json();
    if (status === 'success') location.replace('/');
  } catch (err) {
    console.error(err.response.data);
  }
};

const form = document
  .querySelector('.form')
  .addEventListener('submit', event => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);

    event.preventDefault();
  });
