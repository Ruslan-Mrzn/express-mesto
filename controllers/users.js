const User = require('../models/user');

const {
  INCORRECT_DATA,
  NOT_FOUND,
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
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
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
