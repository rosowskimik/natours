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
    const data = await res.json();
    console.log(data);
    console.log(window.location.replace('/'));
  } catch (err) {
    console.error(err);
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
