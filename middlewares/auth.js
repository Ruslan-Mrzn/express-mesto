const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const {
  UNAUTHORIZED,
} = require('../utils/utils');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
