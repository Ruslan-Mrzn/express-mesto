const router = require('express').Router();
const { celebrate, Joi } = require('celebrate'); // миддлвар для валидации приходящих на сервер запросов
// eslint-disable-next-line no-unused-vars
const validator = require('validator');

const { checkURL } = require('../utils/utils');

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().custom(checkURL).required(),
  }),
}), createCard);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), deleteCard);

router.put('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), likeCard);

router.delete('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), dislikeCard);

module.exports = router;
