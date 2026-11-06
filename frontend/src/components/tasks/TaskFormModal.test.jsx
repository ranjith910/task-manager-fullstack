import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskFormModal from "./TaskFormModal";
import taskService from "../../services/taskService";
import { loggedInState, renderWithProviders } from "../../test/renderWithProviders";

vi.mock("../../services/taskService", () => ({
  default: { createTask: vi.fn(), updateTask: vi.fn() },
}));

describe("TaskFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation errors and doesn't call the API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskFormModal onClose={vi.fn()} />, { preloadedState: loggedInState() });

    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Pick a due date")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it("creates a task with trimmed values and closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    taskService.createTask.mockResolvedValue({ id: "1", title: "Write tests" });
    const { store } = renderWithProviders(<TaskFormModal onClose={onClose} />, {
      preloadedState: loggedInState(),
    });

    await user.type(screen.getByLabelText("Title"), "  Write tests  ");
    await user.type(screen.getByLabelText("Due date"), "2026-12-01");
    await user.selectOptions(screen.getByLabelText("Priority"), "High");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(taskService.createTask).toHaveBeenCalledWith({
      title: "Write tests",
      description: "",
      dueDate: "2026-12-01",
      priority: "High",
      status: "Pending",
    });
    expect(onClose).toHaveBeenCalled();
    expect(store.getState().tasks.version).toBe(1);
  });

  it("prefills the form when editing and shows server field errors", async () => {
    const user = userEvent.setup();
    taskService.updateTask.mockRejectedValue({
      response: {
        data: {
          message: "Validation failed",
          errors: [{ field: "title", message: "Title must be at most 100 characters" }],
        },
      },
    });
    const task = {
      id: "42",
      title: "Old title",
      description: "notes",
      dueDate: "2026-11-20T00:00:00.000Z",
      priority: "Low",
      status: "In Progress",
    };
    renderWithProviders(<TaskFormModal task={task} onClose={vi.fn()} />, {
      preloadedState: loggedInState(),
    });

    expect(screen.getByRole("dialog", { name: "Edit task" })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Old title");
    expect(screen.getByLabelText("Due date")).toHaveValue("2026-11-20");
    expect(screen.getByLabelText("Status")).toHaveValue("In Progress");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(taskService.updateTask).toHaveBeenCalledWith(
      "42",
      expect.objectContaining({ title: "Old title" }),
    );
    expect(await screen.findByText("Title must be at most 100 characters")).toBeInTheDocument();
  });
});
