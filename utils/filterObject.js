const defaultFilters = [
  'role',
  'passwordChangedAt',
  'resetToken',
  'resetTokenExpiration',
  'confirmToken',
  'confirmTokenExpiration',
  'active'
];

const filterObject = (obj, filters = defaultFilters) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (!filters.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = filterObject;
