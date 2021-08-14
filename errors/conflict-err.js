const CONFLICT = 409;
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = CONFLICT;
  }
}

module.exports = ConflictError;
