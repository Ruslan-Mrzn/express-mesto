const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorized-err');

const { getSecret } = require('../utils/utils');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, getSecret());
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Необходима авторизация'));
    }
    next(err);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
