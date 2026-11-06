const mongoose = require("mongoose");
const env = require("../config/env");
const AppError = require("../utils/AppError");

const notFound = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// turn known library errors into AppErrors, returns null for real bugs
const toAppError = (err) => {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new AppError(400, "Validation failed", errors);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new AppError(400, `Invalid value for ${err.path}`);
  }

  // duplicate key (only unique field we have is email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return new AppError(409, `This ${field} is already in use`, [
      { field, message: `This ${field} is already in use` },
    ]);
  }

  // from express.json()
  if (err.type === "entity.parse.failed") {
    return new AppError(400, "Malformed JSON in request body");
  }
  if (err.type === "entity.too.large") {
    return new AppError(413, "Request body is too large");
  }

  return null;
};

// Express 5 sends errors thrown in async handlers here, so controllers can just throw.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const appError = toAppError(err);

  if (!appError) {
    console.error(`${req.method} ${req.originalUrl} failed:`, err);
  }

  const body = {
    success: false,
    message: appError ? appError.message : "Something went wrong, please try again later",
  };
  if (appError?.errors?.length) body.errors = appError.errors;
  // only show stack traces locally
  if (!appError && env.NODE_ENV === "development") body.stack = err.stack;

  res.status(appError ? appError.statusCode : 500).json(body);
};

module.exports = { notFound, errorHandler };
