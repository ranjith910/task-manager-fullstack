import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { FormField } from "../ui/FormField";
import { inputClass } from "../ui/inputClass";
import { createTask, updateTask } from "../../redux/slices/taskSlice";
import { TASK_PRIORITIES, TASK_STATUSES } from "../../utils/constants";
import { dueDateString } from "../../utils/dates";
import { toFieldErrors } from "../../utils/apiError";
import { focusFirstError } from "../../utils/forms";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;
const FIELD_IDS = {
  title: "task-title",
  description: "task-description",
  dueDate: "task-due-date",
  priority: "task-priority",
  status: "task-status",
};

const validate = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  else if (form.title.trim().length > TITLE_MAX)
    errors.title = `Keep it under ${TITLE_MAX} characters`;
  if (form.description.length > DESCRIPTION_MAX) {
    errors.description = `Keep it under ${DESCRIPTION_MAX} characters`;
  }
  if (!form.dueDate) errors.dueDate = "Pick a due date";
  return errors;
};

// The parent only renders this while it's open, so the form state starts fresh every time.
function TaskFormModal({ task, defaultDueDate = "", onClose }) {
  const dispatch = useDispatch();
  const isEditing = Boolean(task);

  const [form, setForm] = useState(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    dueDate: task ? dueDateString(task.dueDate) : defaultDueDate,
    priority: task?.priority ?? "Medium",
    status: task?.status ?? "Pending",
  }));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);
    focusFirstError(validationErrors, FIELD_IDS);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = { ...form, title: form.title.trim(), description: form.description.trim() };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dispatch(updateTask({ id: task.id, changes: payload })).unwrap();
        toast.success("Task updated");
      } else {
        await dispatch(createTask(payload)).unwrap();
        toast.success("Task created");
      }
      onClose();
    } catch (err) {
      setErrors(toFieldErrors(err.errors));
      focusFirstError(toFieldErrors(err.errors), FIELD_IDS);
      toast.error(err.message || "Couldn't save the task");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit task" : "New task"}
      description={isEditing ? "Update the details of this task." : "Add a task to your list."}
      onClose={isSubmitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
        <FormField id="task-title" label="Title" error={errors.title}>
          {(field) => (
            <input
              {...field}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Finish the API docs"
              maxLength={TITLE_MAX}
              className={inputClass(errors.title)}
            />
          )}
        </FormField>

        <FormField
          id="task-description"
          label="Description"
          error={errors.description}
          hint={`${form.description.length}/${DESCRIPTION_MAX}`}
        >
          {(field) => (
            <textarea
              {...field}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add some details (optional)"
              rows={3}
              maxLength={DESCRIPTION_MAX}
              className={`${inputClass(errors.description)} resize-none`}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField id="task-due-date" label="Due date" error={errors.dueDate}>
            {(field) => (
              <input
                {...field}
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={inputClass(errors.dueDate)}
              />
            )}
          </FormField>

          <FormField id="task-priority" label="Priority" error={errors.priority}>
            {(field) => (
              <select
                {...field}
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClass(errors.priority)}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            )}
          </FormField>

          <FormField id="task-status" label="Status" error={errors.status}>
            {(field) => (
              <select
                {...field}
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass(errors.status)}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskFormModal;
