const User = require("../models/User");
const AppError = require("../utils/AppError");
const { COOKIE_NAME, verifyToken } = require("../utils/token");

// cookie for the browser, Bearer header for Postman / other clients
const getToken = (req) => {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];

  const header = req.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();

  return null;
};

const protect = async (req, _res, next) => {
  const token = getToken(req);
  if (!token) {
    throw new AppError(401, "You are not logged in");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new AppError(
      401,
      err.name === "TokenExpiredError"
        ? "Your session has expired, please log in again"
        : "Invalid session, please log in again",
    );
  }

  const user = await User.findById(payload.sub).select("+passwordChangedAt");
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  if (user.changedPasswordAfter(payload.iat)) {
    throw new AppError(401, "Password was changed, please log in again");
  }

  req.user = user;
  next();
};

module.exports = { protect };
