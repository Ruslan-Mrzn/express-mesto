require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate'); // миддлвар для валидации приходящих на сервер запросов
// eslint-disable-next-line no-unused-vars
const validator = require('validator');

const NotFoundError = require('./errors/not-found-err');

const { checkURL } = require('./utils/utils');

const {
  login, createUser,
} = require('./controllers/users');

const app = express();

app.use(express.json()); // для собирания JSON-формата
app.use(express.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cookieParser()); // подключаем парсер кук как мидлвэр

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(4),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(4),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(checkURL),
  }),
}), createUser);

// авторизация
app.use(celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }).unknown(true),
}), require('./middlewares/auth'));

app.use('/users', require('./routes/users'));

app.use('/cards', require('./routes/cards'));

app.use('*', () => { throw new NotFoundError('Ресурс не найден'); });

// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => { // наш централизованный обработчик
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}, app mode is ${process.env.NODE_ENV ? 'production' : 'development'}`);
});
