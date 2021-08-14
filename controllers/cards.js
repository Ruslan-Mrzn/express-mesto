const Card = require('../models/card');

const IncorrectDataError = require('../errors/incorrect-data-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { user: { _id }, body: { name, link } } = req;

  Card.create({ name, link, owner: _id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка! Переданы некорректные данные при создании карточки'));
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { params: { id }, user: { _id } } = req;

  Card.findById(id)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки с таким id');
      }
      if (JSON.stringify(card.owner) !== JSON.stringify(_id)) {
        throw new ForbiddenError('Вы можете удалять только свои карточки');
      }
      Card.findByIdAndRemove(card.id)
        .then((myCard) => res.send({ data: myCard }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Невалидный id карточки'));
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const { user: { _id }, params: { id } } = req;

  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: _id } }, // добавить _id в массив, если его там нет
    { new: true }, // обработчик then получит на вход обновлённую запись
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки с таким id');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка! Переданы некорректные данные для постановки лайка'));
      }
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Невалидный id карточки'));
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { user: { _id }, params: { id } } = req;
  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: _id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки с таким id');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка! Переданы некорректные данные для снятия лайка'));
      }
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Невалидный id карточки'));
      }
      next(err);
    });
};
