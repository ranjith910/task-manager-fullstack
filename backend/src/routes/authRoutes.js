const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  authLimiter,
  loginAccountLimiter,
  passwordChangeLimiter,
} = require("../middleware/rateLimiters");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/authSchemas");
const {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), register);
router.post("/login", authLimiter, loginAccountLimiter, validate({ body: loginSchema }), login);
router.post("/logout", logout);

router
  .route("/me")
  .get(protect, getMe)
  .patch(protect, validate({ body: updateProfileSchema }), updateMe);

router.patch(
  "/password",
  protect,
  passwordChangeLimiter,
  validate({ body: changePasswordSchema }),
  changePassword,
);

module.exports = router;
