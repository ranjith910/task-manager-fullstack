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

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  // tokens from before the last password change carry an older version
  if ((payload.ver ?? 0) !== user.tokenVersion) {
    throw new AppError(401, "Your password was changed, please log in again");
  }

  req.user = user;
  next();
};

module.exports = { protect };
