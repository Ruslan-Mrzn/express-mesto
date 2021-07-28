const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: "Ошибка при чтении списка пользователей" }))
}

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Ошибка при чтении данных о пользователе" }));
}

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Ошибка при создании нового пользователя" }));
}

module.exports.updateProfile = (req, res) => {
  const { newName, newAbout } = req.body;

  User.findByIdAndUpdate(req.user._id, { name: newName, about: newAbout }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false // если пользователь не найден, он не будет создан (это значение по умолчанию)
  })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Ошибка при обновлении профиля пользователя" }));
}

module.exports.updateAvatar = (req, res) => {
  const { newAvatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar: newAvatar }, { new: true, runValidators: true })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Ошибка при обновлении аватарки пользователя" }));
}

