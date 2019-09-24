const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/monthly-stats/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'guide', 'lead-guide'),
    tourController.getMonthlyStats
  );

router
  .route('/tours-within/:range/center/:latlng/units/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/units/:unit').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
