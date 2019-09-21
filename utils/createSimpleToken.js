const crypto = require('crypto');

const createSimpleToken = () => {
  const newToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(newToken)
    .digest('hex');

  return { newToken, hashedToken };
};

module.exports = createSimpleToken;
