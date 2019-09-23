const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model, cb = () => ({})) =>
  catchAsync(async (req, res) => {
    const filter = cb(req);

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        [Model.collection.name]: docs
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that id.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [Model.collection.name.substring(
          0,
          Model.collection.name.length - 1
        )]: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        [Model.collection.name.substring(
          0,
          Model.collection.name.length - 1
        )]: newDoc
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that id.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [Model.collection.name.substring(
          0,
          Model.collection.name.length - 1
        )]: doc
      }
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that id.', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.serveTemplate = (template, title) => (req, res) => {
  res.status(200).render(template, {
    title
  });
};
