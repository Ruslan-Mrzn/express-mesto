const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET } = process.env;

const {
  INCORRECT_DATA,
  NOT_FOUND,
  UNAUTHORIZED,
  sendServerErrorMessage,
  sendUserNotFoundByIdMessage,
  sendInvalidIdMessage,
} = require('../utils/utils');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => sendServerErrorMessage(res));
};

module.exports.getUser = (req, res) => {
  const { id } = req.params;
  if (id === 'me') {
    User.findById(req.user._id)
      .then((user) => res.send({ data: user }));
    return;
  }
  User.findById(id)
    .orFail(() => {
      const error = new Error('Пользователь по заданному id отсутствует в базе');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        sendInvalidIdMessage(res);
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        sendUserNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные при создании пользователя' });
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.updateProfile = (req, res) => {
  const { user: { _id }, body: { name, about } } = req;

  User.findByIdAndUpdate(_id, { name, about }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false, // если пользователь не найден, он не будет создан (это значение по умолчанию)
  })
    .orFail(() => {
      const error = new Error('Пользователь по заданному id отсутствует в базе');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные при обновлении профиля пользователя' });
        return;
      }
      if (err.name === 'CastError') {
        sendInvalidIdMessage(res);
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        sendUserNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.updateAvatar = (req, res) => {
  const { user: { _id }, body: { avatar } } = req;

  User.findByIdAndUpdate(_id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error('Пользователь по заданному id отсутствует в базе');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные при обновлении аватара' });
        return;
      }
      if (err.name === 'CastError') {
        sendInvalidIdMessage(res);
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        sendUserNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.login = (req, res) => {
  const { body: { email, password } } = req;
  // Собственный метод проверки почты и пароля
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      // создадим токен
      const token = jwt.sign({ _id: user._id }, JWT_SECRET);
      // вернём токен
      // отправим токен, браузер сохранит его в куках

      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600000 * 24 * 7, // кука будет храниться 7 дней
          httpOnly: true, // такую куку нельзя прочесть из JavaScript
          sameSite: true, // добавили опцию защиты от автоматической отправки кук
        })
        .send({ data: user }); // если у ответа нет тела, можно использовать метод end
    })
    .catch((err) => {
      // ошибка аутентификации
      res.status(UNAUTHORIZED).send({ message: err.message });
    });
};
