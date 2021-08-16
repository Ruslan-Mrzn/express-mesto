const validator = require('validator');

const { JWT_SECRET } = process.env;

module.exports.getSecret = () => {
  if (process.env.NODE_ENV === 'production') {
    return JWT_SECRET;
  }
  return 'devMode';
};

// eslint-disable-next-line consistent-return
module.exports.checkURL = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new Error('message: введите корректный url-адрес');
  }
  return value;
};
