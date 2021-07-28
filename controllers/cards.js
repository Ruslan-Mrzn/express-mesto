const Card = require('../models/card');

module.exports.getCards = (req,res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: "Ошибка при чтении списка карточек" }))
}

module.exports.createCard = (req,res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "Ошибка при создании новой карточки" }))
}

module.exports.deleteCard = (req,res) => {
  Card.findByIdAndRemove(req.params.id)
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка при удалении карточки' }));
}

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate (
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  ) // обработчик then получит на вход обновлённую запись
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "Ошибка при попытке добавить лайк карточке" }))
}

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate (
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  )
    .then(card => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "Ошибка при попытке удалить лайк карточки" }))
}