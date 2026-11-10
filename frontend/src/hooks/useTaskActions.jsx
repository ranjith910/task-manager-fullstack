import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import TaskFormModal from "../components/tasks/TaskFormModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { deleteTask, updateTask } from "../redux/slices/taskSlice";

// Create / edit / delete / complete, shared by the dashboard, My Tasks and the calendar.
// Pages call the handlers and render `modals` somewhere in their JSX.
export default function useTaskActions() {
  const dispatch = useDispatch();
  const [formState, setFormState] = useState(null); // { task } when editing, { defaultDueDate } when creating
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = (defaultDueDate) =>
    setFormState({
      task: null,
      defaultDueDate: typeof defaultDueDate === "string" ? defaultDueDate : "",
    });

  const openEdit = (task) => setFormState({ task });

  // ids with a toggle request in flight. The task prop only updates once the request
  // finishes, so a quick second click would otherwise send the same change again.
  const togglingIds = useRef(new Set());

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(taskToDelete.id)).unwrap();
      toast.success("Task deleted");
      setTaskToDelete(null);
    } catch (err) {
      if (err.status === 404) {
        toast.error("That task was already deleted");
        setTaskToDelete(null);
      } else {
        toast.error(err.message || "Couldn't delete the task");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleComplete = async (task) => {
    if (togglingIds.current.has(task.id)) return;
    togglingIds.current.add(task.id);

    const status = task.status === "Completed" ? "Pending" : "Completed";
    try {
      await dispatch(updateTask({ id: task.id, changes: { status } })).unwrap();
      toast.success(status === "Completed" ? "Task completed" : "Task moved back to pending");
    } catch (err) {
      toast.error(err.message || "Couldn't update the task");
    } finally {
      togglingIds.current.delete(task.id);
    }
  };

  const modals = (
    <>
      {formState && (
        <TaskFormModal
          task={formState.task}
          defaultDueDate={formState.defaultDueDate}
          onClose={() => setFormState(null)}
        />
      )}
      {taskToDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${taskToDelete.title}" will be deleted permanently. This can't be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  );

  return { openCreate, openEdit, requestDelete: setTaskToDelete, toggleComplete, modals };
}
