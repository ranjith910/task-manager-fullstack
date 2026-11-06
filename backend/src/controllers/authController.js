const bcrypt = require("bcryptjs");
const env = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { setAuthCookie, clearAuthCookie } = require("../utils/token");

// When the email doesn't exist we still run a bcrypt compare against this,
// so the response time doesn't tell an attacker which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

const emailTakenError = () =>
  new AppError(409, "An account with this email already exists", [
    { field: "email", message: "This email is already in use" },
  ]);

// the public demo login is shared, so nobody should be able to lock others out of it
const ensureNotDemoAccount = (user) => {
  if (user.email === env.DEMO_EMAIL) {
    throw new AppError(403, "The demo account can't be changed. Sign up to try this.");
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.validated.body;

  if (await User.exists({ email })) throw emailTakenError();

  const user = await User.create({ name, email, password });

  setAuthCookie(res, user);
  res.status(201).json({ success: true, message: "Account created", data: user });
};

// @desc    Log in
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email }).select("+password");
  const isMatch = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  setAuthCookie(res, user);
  res.status(200).json({ success: true, message: "Logged in", data: user });
};

// @desc    Log out (clears the auth cookie)
// @route   POST /api/auth/logout
// @access  Public
const logout = (_req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out" });
};

// @desc    Get the logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

// @desc    Update name / email
// @route   PATCH /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  ensureNotDemoAccount(req.user);
  const updates = req.validated.body;

  if (updates.email && updates.email !== req.user.email) {
    if (await User.exists({ email: updates.email })) throw emailTakenError();
  }

  req.user.set(updates);
  await req.user.save();

  res.status(200).json({ success: true, message: "Profile updated", data: req.user });
};

// @desc    Change password (logs out other sessions)
// @route   PATCH /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  ensureNotDemoAccount(req.user);
  const { currentPassword, newPassword } = req.validated.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError(400, "Current password is incorrect", [
      { field: "currentPassword", message: "Current password is incorrect" },
    ]);
  }

  user.password = newPassword;
  user.tokenVersion += 1; // every token issued before this stops working
  await user.save();

  setAuthCookie(res, user);
  res.status(200).json({ success: true, message: "Password updated" });
};

module.exports = { register, login, logout, getMe, updateMe, changePassword };
