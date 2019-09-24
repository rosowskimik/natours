const multer = require('multer');
const AppError = require('../utils/appError');

const multerConfig = size => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files can be uploaded', 400), false);
    }
  };

  return multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: size }
  });
};

module.exports = multerConfig;
