const INCORRECT_DATA = 400;
class IncorrectDataError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = INCORRECT_DATA;
  }
}

module.exports = IncorrectDataError;
