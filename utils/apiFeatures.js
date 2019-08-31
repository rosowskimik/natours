class APIFeatures {
  constructor(query, reqQueries) {
    this.query = query;
    this.reqQueries = reqQueries;
  }

  filter() {
    const queryObj = { ...this.reqQueries };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/,
      match => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.reqQueries.sort) {
      const sortBy = this.reqQueries.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.reqQueries.fields) {
      const fields = this.reqQueries.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.reqQueries.page * 1 || 1;
    const limit = this.reqQueries.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
