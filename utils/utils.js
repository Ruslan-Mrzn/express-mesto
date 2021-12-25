const validator = require('validator');

const { NODE_ENV, JWT_SECRET, MONGODB_ADDRESS } = process.env;

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

module.exports.getMongoAddress = () => {
  if (NODE_ENV === 'production') {
    return MONGODB_ADDRESS;
  }
  return 'mongodb+srv://rus_mur:929000@cluster0.21xks.mongodb.net/mestodb?retryWrites=true&w=majority';
};
