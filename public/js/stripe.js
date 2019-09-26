/* eslint-disable */
import axios from 'axios';
import showAlert from './alerts';

const bookTour = async tourId => {
  const stripe = Stripe('pk_test_SMA2Y3VossrmP6SoU4kYz9rC00TxLdckCB');
  try {
    const session = await axios.get(`/api/v1/bookings/checkout/${tourId}`);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default bookTour;
