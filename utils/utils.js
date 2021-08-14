const INCORRECT_DATA = 400;
const NOT_FOUND = 404;
const UNAUTHORIZED = 401;
const SERVER_ERROR = 500;

const sendServerErrorMessage = (res) => {
  res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
};

const sendUserNotFoundByIdMessage = (res) => {
  res.status(NOT_FOUND).send({ message: 'Ошибка! Пользователь по указанному _id не найден' });
};

const sendCardNotFoundByIdMessage = (res) => {
  res.status(NOT_FOUND).send({ message: 'Ошибка! Карточка с указанным _id не найдена' });
};

const sendInvalidIdMessage = (res) => {
  res.status(INCORRECT_DATA).send({ message: 'Ошибка! Невалидный _id' });
};

module.exports = {
  INCORRECT_DATA,
  NOT_FOUND,
  UNAUTHORIZED,
  SERVER_ERROR,
  sendServerErrorMessage,
  sendUserNotFoundByIdMessage,
  sendInvalidIdMessage,
  sendCardNotFoundByIdMessage,
};
