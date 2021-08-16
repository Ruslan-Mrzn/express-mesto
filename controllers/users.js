const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const IncorrectDataError = require('../errors/incorrect-data-err');

const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

const { getSecret } = require('../utils/utils');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err));
};

module.exports.getUser = (req, res, next) => {
  const { id } = req.params;
  if (id === 'me') {
    User.findById(req.user._id)
      .then((user) => res.send({ data: user }))
      .catch((err) => next(err));
    return;
  }
  User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Невалидный id пользователя'));
        return;
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) {
    throw new IncorrectDataError('Email или пароль не могут быть пустыми');
  }
  if (password.length < 4) {
    throw new IncorrectDataError('Пароль должен состоять не менее чем из 4-х символов');
  }
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => res.send({ data: user.hidePassword() }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new IncorrectDataError('Ошибка! Переданы некорректные данные при создании пользователя'));
          }
          if (err.name === 'MongoError' && err.code === 11000) {
            next(new ConflictError('Пользователь с данным email уже зарегистрирован'));
          }
          next(err);
        });
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { user: { _id }, body: { name, about } } = req;

  User.findByIdAndUpdate(_id, { name, about }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false, // если пользователь не найден, он не будет создан (это значение по умолчанию)
  })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка! Переданы некорректные данные при обновлении профиля пользователя'));
        return;
      }
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Невалидный id пользователя'));
        return;
      }
      next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { user: { _id }, body: { avatar } } = req;

  User.findByIdAndUpdate(_id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка! Переданы некорректные данные при обновлении аватара'));
        return;
      }
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Невалидный id пользователя'));
        return;
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { body: { email, password } } = req;
  // Собственный метод проверки почты и пароля
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      // создадим токен
      const token = jwt.sign({ _id: user._id }, getSecret());
      // отправим токен, браузер сохранит его в куках

      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600000 * 24 * 7, // кука будет храниться 7 дней
          httpOnly: true, // такую куку нельзя прочесть из JavaScript
          sameSite: true, // добавили опцию защиты от автоматической отправки кук
        })
        .send({ data: user.hidePassword() }); // если у ответа нет тела,можно использовать метод end
    })
    .catch((err) => next(err));
};
