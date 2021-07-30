const Card = require('../models/card');

const INCORRECT_DATA = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

const sendServerErrorMessage = (res) => {
  res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
};

const sendCardNotFoundByIdMessage = (res) => {
  res.status(NOT_FOUND).send({ message: 'Ошибка! Карточка с указанным _id не найдена' });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => sendServerErrorMessage(res));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные при создании карточки' });
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .then((card) => res.send({ data: card }))
    .catch(() => sendCardNotFoundByIdMessage(res));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ) // обработчик then получит на вход обновлённую запись
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные для постановки лайка' });
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные для снятия лайка' });
        return;
      }
      sendServerErrorMessage(res);
    });
};
