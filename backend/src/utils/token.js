const jwt = require("jsonwebtoken");
const env = require("../config/env");

const COOKIE_NAME = "token";

// "7d", "12h", "30m", "45s" or plain seconds -> milliseconds
const toMs = (value) => {
  const match = /^(\d+)([smhd]?)$/.exec(String(value).trim());
  if (!match) throw new Error(`Invalid JWT_EXPIRES_IN: ${value}`);
  const unit = { "": 1000, s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return Number(match[1]) * unit;
};

const maxAge = toMs(env.JWT_EXPIRES_IN);

// ver = the user's tokenVersion, so changing the password can invalidate old tokens
const signToken = (user) =>
  jwt.sign({ sub: String(user._id), ver: user.tokenVersion ?? 0 }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: Math.floor(maxAge / 1000),
  });

// pin the algorithm so a token can't pick its own
const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

// httpOnly so the token can't be read from JS in the browser
const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.COOKIE_SAME_SITE,
  path: "/",
};

const setAuthCookie = (res, user) => {
  res.cookie(COOKIE_NAME, signToken(user), { ...cookieOptions, maxAge });
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
};

module.exports = { COOKIE_NAME, signToken, verifyToken, setAuthCookie, clearAuthCookie };
