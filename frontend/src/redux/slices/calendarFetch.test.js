import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCalendarTasks } from "./taskSlice";
import { setupStore } from "../store";
import taskService from "../../services/taskService";

vi.mock("../../services/taskService", () => ({
  default: { getTasks: vi.fn() },
}));

const page = (pageNumber, totalPages, total) => ({
  data: [{ id: `task-${pageNumber}`, title: `Task ${pageNumber}` }],
  pagination: { page: pageNumber, limit: 100, total, totalPages },
});

describe("fetchCalendarTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("makes one request when everything fits on a page", async () => {
    taskService.getTasks.mockResolvedValueOnce(page(1, 1, 1));
    const store = setupStore();

    await store.dispatch(fetchCalendarTasks({ from: "2026-11-01", to: "2026-12-05" }));

    expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    expect(taskService.getTasks.mock.calls[0][0]).toMatchObject({
      dueFrom: "2026-11-01",
      dueTo: "2026-12-05",
      page: 1,
      limit: 100,
    });
    expect(store.getState().tasks.calendar.items).toHaveLength(1);
  });

  it("loads the remaining pages and merges them", async () => {
    taskService.getTasks
      .mockResolvedValueOnce(page(1, 3, 250))
      .mockResolvedValueOnce(page(2, 3, 250))
      .mockResolvedValueOnce(page(3, 3, 250));
    const store = setupStore();

    await store.dispatch(fetchCalendarTasks({ from: "2026-11-01", to: "2026-12-05" }));

    expect(taskService.getTasks.mock.calls.map((call) => call[0].page)).toEqual([1, 2, 3]);
    const { items, total } = store.getState().tasks.calendar;
    expect(items.map((task) => task.id)).toEqual(["task-1", "task-2", "task-3"]);
    expect(total).toBe(250);
  });

  it("stops after 5 pages", async () => {
    taskService.getTasks.mockImplementation((params) => Promise.resolve(page(params.page, 9, 900)));
    const store = setupStore();

    await store.dispatch(fetchCalendarTasks({ from: "2026-11-01", to: "2026-12-05" }));

    expect(taskService.getTasks).toHaveBeenCalledTimes(5);
    expect(store.getState().tasks.calendar.items).toHaveLength(5);
  });
});
