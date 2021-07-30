const User = require('../models/user');

const INCORRECT_DATA = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

const sendServerErrorMessage = (res) => {
  res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
};

const sendUserNotFoundByIdMessage = (res) => {
  res.status(NOT_FOUND).send({ message: 'Ошибка! Пользователь по указанному _id не найден' });
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => sendServerErrorMessage(res));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
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
  const { newName, newAbout } = req.body;

  User.findByIdAndUpdate(req.user._id, { name: newName, about: newAbout }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false, // если пользователь не найден, он не будет создан (это значение по умолчанию)
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные при обновлении профиля пользователя' });
        return;
      }
      if (err.name === 'CastError') {
        sendUserNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.updateAvatar = (req, res) => {
  const { newAvatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar: newAvatar }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные при обновлении аватара' });
        return;
      }
      if (err.name === 'CastError') {
        sendUserNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};
