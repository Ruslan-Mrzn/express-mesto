const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/unauthorized-err');

const { JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Необходима авторизация'));
    }
    next(err);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
