/* eslint-disable */
const hideAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) alert.parentElement.removeChild(alert);
};

const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);

  setTimeout(() => hideAlert(), 3000);
};

export default showAlert;
