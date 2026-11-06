// mirrors the password rules in the API (bcrypt only looks at the first 72 bytes)
export const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (new TextEncoder().encode(password).length > 72) return "Password is too long";
  if (!/[A-Za-z]/.test(password)) return "Password must contain a letter";
  if (!/\d/.test(password)) return "Password must contain a number";
  return null;
};
