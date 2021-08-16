const mongoose = require('mongoose');
const npmValidator = require('validator');
const bcrypt = require('bcryptjs');

const UnauthorizedError = require('../errors/unauthorized-err');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: (v) => npmValidator.isEmail(v),
  },

  password: {
    type: String,
    required: true,
    select: false, // необходимо добавить поле select (чтобы убрать его из выдачи в теле ответа)
  },

  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },

  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },

  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(v) {
        return /(https?:\/\/)(w{3}\.)?([a-z0-9\-._~:/?#[\]@!$&'()*+,;=])(#)?/.test(v);
      },
    },
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  // попытаемся найти пользователя по почте
  return this.findOne({ email }).select('+password')
    .then((user) => {
      // не нашёлся — отправляем ошибку
      if (!user) {
        throw new UnauthorizedError('Неправильная почта или пароль');
      }
      // нашёлся — сравниваем хеши
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильная почта или пароль');
          }
          // вернем для доступа к этому объекту в контроллере
          return user;
        });
    });
  // блок catch находится в контроллере
};

function hidePassword() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
}

userSchema.methods.hidePassword = hidePassword;

module.exports = mongoose.model('user', userSchema);
