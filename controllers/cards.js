const Card = require('../models/card');

const {
  INCORRECT_DATA,
  NOT_FOUND,
  sendServerErrorMessage,
  sendInvalidIdMessage,
  sendCardNotFoundByIdMessage,
} = require('../utils/utils');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => sendServerErrorMessage(res));
};

module.exports.createCard = (req, res) => {
  const { user: { _id }, body: { name, link } } = req;

  Card.create({ name, link, owner: _id })
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
  const { id } = req.params;
  Card.findByIdAndRemove(id)
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        sendInvalidIdMessage(res);
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        sendCardNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.likeCard = (req, res) => {
  const { user: { _id }, params: { id } } = req;

  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: _id } }, // добавить _id в массив, если его там нет
    { new: true }, // обработчик then получит на вход обновлённую запись
  )
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные для постановки лайка' });
        return;
      }
      if (err.name === 'CastError') {
        sendInvalidIdMessage(res);
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        sendCardNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};

module.exports.dislikeCard = (req, res) => {
  const { user: { _id }, params: { id } } = req;
  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: _id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INCORRECT_DATA).send({ message: 'Ошибка! Переданы некорректные данные для снятия лайка' });
        return;
      }
      if (err.name === 'CastError') {
        sendInvalidIdMessage(res);
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        sendCardNotFoundByIdMessage(res);
        return;
      }
      sendServerErrorMessage(res);
    });
};
