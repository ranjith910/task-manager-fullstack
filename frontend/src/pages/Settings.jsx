import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { FormField, PasswordInput } from "../components/ui/FormField";
import { inputClass } from "../components/ui/inputClass";
import { changePassword, updateProfile } from "../redux/slices/authSlice";
import { toFieldErrors } from "../utils/apiError";
import { formatDate } from "../utils/dates";
import { validatePassword } from "../utils/validation";
import useDocumentTitle from "../hooks/useDocumentTitle";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SettingsCard({ title, description, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 grid md:grid-cols-3 gap-6 p-6">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </section>
  );
}

function ProfileForm({ disabled }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // only send what actually changed
  const changes = {};
  if (form.name.trim() !== user.name) changes.name = form.name.trim();
  if (form.email.trim().toLowerCase() !== user.email) changes.email = form.email.trim();
  const hasChanges = Object.keys(changes).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges || isSaving) return;

    const validationErrors = {};
    if (form.name.trim().length < 2) validationErrors.name = "Name must be at least 2 characters";
    if (!EMAIL_PATTERN.test(form.email.trim())) validationErrors.email = "Enter a valid email";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      const updated = await dispatch(updateProfile(changes)).unwrap();
      setForm({ name: updated.name, email: updated.email });
      toast.success("Profile updated");
    } catch (err) {
      setErrors(toFieldErrors(err.errors));
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard title="Profile" description="Your name and the email you log in with.">
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={user.name} size="w-14 h-14 text-lg" />
        <div>
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-400">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={disabled} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField id="profile-name" label="Full name" error={errors.name}>
              {(field) => (
                <input
                  {...field}
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass(errors.name)}
                />
              )}
            </FormField>
            <FormField id="profile-email" label="Email" error={errors.email}>
              {(field) => (
                <input
                  {...field}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass(errors.email)}
                />
              )}
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving} disabled={!hasChanges}>
              Save changes
            </Button>
          </div>
        </fieldset>
      </form>
    </SettingsCard>
  );
}

const emptyPasswords = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordForm({ disabled }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(emptyPasswords);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const validationErrors = {};
    if (!form.currentPassword) validationErrors.currentPassword = "Enter your current password";
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) validationErrors.newPassword = passwordError;
    else if (form.newPassword === form.currentPassword) {
      validationErrors.newPassword = "New password must be different from the current one";
    }
    if (form.confirmPassword !== form.newPassword) {
      validationErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      await dispatch(
        changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      ).unwrap();
      setForm(emptyPasswords);
      toast.success("Password updated. Other devices have been logged out.");
    } catch (err) {
      setErrors(toFieldErrors(err.errors));
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard title="Password" description="Changing it logs you out everywhere else.">
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={disabled} className="space-y-5">
          <FormField id="current-password" label="Current password" error={errors.currentPassword}>
            {(field) => (
              <PasswordInput
                {...field}
                name="currentPassword"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange}
                hasError={Boolean(errors.currentPassword)}
              />
            )}
          </FormField>
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField
              id="new-password"
              label="New password"
              error={errors.newPassword}
              hint="8+ characters with a letter and a number"
            >
              {(field) => (
                <PasswordInput
                  {...field}
                  name="newPassword"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={handleChange}
                  hasError={Boolean(errors.newPassword)}
                />
              )}
            </FormField>
            <FormField
              id="confirm-password"
              label="Confirm new password"
              error={errors.confirmPassword}
            >
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
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Update password
            </Button>
          </div>
        </fieldset>
      </form>
    </SettingsCard>
  );
}

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL?.toLowerCase();

function Settings() {
  useDocumentTitle("Settings");
  const email = useSelector((state) => state.auth.user.email);
  // the API refuses these changes for the shared demo account anyway
  const isDemo = Boolean(DEMO_EMAIL) && email === DEMO_EMAIL;

  return (
    <div className="max-w-4xl space-y-6">
      {isDemo && (
        <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          You're using the shared demo account, so profile and password changes are turned off.
          Create your own account to try them.
        </p>
      )}
      <ProfileForm disabled={isDemo} />
      <PasswordForm disabled={isDemo} />
    </div>
  );
}

export default Settings;
