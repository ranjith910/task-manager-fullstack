import { useState } from "react";
import { Link } from "react-router";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/ui/Button";
import { FormField, PasswordInput } from "../components/ui/FormField";
import { inputClass } from "../components/ui/inputClass";
import { register } from "../redux/slices/authSlice";
import { toFieldErrors } from "../utils/apiError";
import { validatePassword } from "../utils/validation";
import useDocumentTitle from "../hooks/useDocumentTitle";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// same rules as the API, so most mistakes are caught before the request
const validate = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  const trimmedName = name.trim();

  if (trimmedName.length < 2) errors.name = "Name must be at least 2 characters";
  else if (trimmedName.length > 50) errors.name = "Name must be at most 50 characters";

  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email";

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match";

  return errors;
};

function Register() {
  useDocumentTitle("Sign up");
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const user = await dispatch(
        register({ name: form.name.trim(), email: form.email.trim(), password: form.password }),
      ).unwrap();
      toast.success(`Welcome to Tasknix, ${user.name.split(" ")[0]}!`);
    } catch (err) {
      const fieldErrors = toFieldErrors(err.errors);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <FormField id="name" label="Full name" error={errors.name}>
          {(field) => (
            <input
              {...field}
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className={inputClass(errors.name)}
            />
          )}
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
          {(field) => (
            <input
              {...field}
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClass(errors.email)}
            />
          )}
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password}
          hint="At least 8 characters, with a letter and a number"
        >
          {(field) => (
            <PasswordInput
              {...field}
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              hasError={Boolean(errors.password)}
            />
          )}
        </FormField>

        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
          {(field) => (
            <PasswordInput
              {...field}
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              hasError={Boolean(errors.confirmPassword)}
            />
          )}
        </FormField>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;
