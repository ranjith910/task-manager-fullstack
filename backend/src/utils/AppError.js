// Errors we expect (404, 401, validation...) and are fine showing to the client.
// Anything else that gets thrown is treated as a 500 by the error middleware.
class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = AppError;
