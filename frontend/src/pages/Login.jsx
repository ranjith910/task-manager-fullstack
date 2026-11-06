import { useState } from "react";
import { Link } from "react-router";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/ui/Button";
import { FormField, PasswordInput } from "../components/ui/FormField";
import { inputClass } from "../components/ui/inputClass";
import { login } from "../redux/slices/authSlice";
import { toFieldErrors } from "../utils/apiError";
import useDocumentTitle from "../hooks/useDocumentTitle";

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD;

const validate = ({ email, password }) => {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  return errors;
};

function Login() {
  useDocumentTitle("Log in");
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  // on success GuestRoute redirects, so there's nothing else to do here
  const submit = async (credentials) => {
    setIsSubmitting(true);
    try {
      const user = await dispatch(login(credentials)).unwrap();
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
    } catch (err) {
      const fieldErrors = toFieldErrors(err.errors);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      submit({ email: form.email.trim(), password: form.password });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your tasks."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign up
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

        <FormField id="password" label="Password" error={errors.password}>
          {(field) => (
            <PasswordInput
              {...field}
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              hasError={Boolean(errors.password)}
            />
          )}
        </FormField>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>

        {DEMO_EMAIL && DEMO_PASSWORD && (
          <Button
            variant="secondary"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => submit({ email: DEMO_EMAIL, password: DEMO_PASSWORD })}
          >
            Try the demo account
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}

export default Login;
