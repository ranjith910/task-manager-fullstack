const { z } = require("zod");

const name = z
  .string("Name is required")
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters");

const email = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .pipe(z.email("Please provide a valid email"));

// bcrypt ignores anything after 72 bytes (not characters, emoji etc. take more than one)
const password = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password is too long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

const registerSchema = z.strictObject({ name, email, password });

const loginSchema = z.strictObject({
  email,
  password: z.string("Password is required").min(1, "Password is required"),
});

const updateProfileSchema = z
  .strictObject({
    name: name.optional(),
    email: email.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, "Nothing to update");

const changePasswordSchema = z
  .strictObject({
    currentPassword: z
      .string("Current password is required")
      .min(1, "Current password is required"),
    newPassword: password,
  })
  .refine((body) => body.currentPassword !== body.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
