import { describe, expect, it } from "vitest";
import reducer, {
  createTask,
  deleteTask,
  fetchTasks,
  initialFilters,
  resetFilters,
  setFilters,
  setSearch,
  showTasks,
  updateTask,
} from "./taskSlice";
import { logout } from "./authSlice";

const initial = reducer(undefined, { type: "init" });

const task = (id, title = `Task ${id}`) => ({ id, title, status: "Pending" });

describe("taskSlice filters", () => {
  it("goes back to page 1 when a filter changes", () => {
    let state = reducer(initial, setFilters({ page: 3 }));
    expect(state.filters.page).toBe(3);

    state = reducer(state, setFilters({ status: "Completed" }));
    expect(state.filters).toMatchObject({ status: "Completed", page: 1 });
  });

  it("setSearch does nothing when the value is the same", () => {
    const onPage3 = reducer(initial, setFilters({ page: 3 }));
    expect(reducer(onPage3, setSearch(""))).toBe(onPage3);
    expect(reducer(onPage3, setSearch("docs")).filters).toMatchObject({ search: "docs", page: 1 });
  });

  it("showTasks and resetFilters start from clean filters but keep the page size", () => {
    let state = reducer(initial, setFilters({ limit: 50, priority: "High", search: "x" }));

    state = reducer(state, showTasks({ overdue: true }));
    expect(state.filters).toEqual({ ...initialFilters, limit: 50, overdue: true });

    state = reducer(state, resetFilters());
    expect(state.filters).toEqual({ ...initialFilters, limit: 50 });
  });
});

describe("taskSlice requests", () => {
  it("ignores the response of an older request", () => {
    let state = reducer(initial, fetchTasks.pending("old-request", initialFilters));
    state = reducer(state, fetchTasks.pending("new-request", initialFilters));

    const payload = (items) => ({
      data: items,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    state = reducer(
      state,
      fetchTasks.fulfilled(payload([task("new")]), "new-request", initialFilters),
    );
    state = reducer(
      state,
      fetchTasks.fulfilled(payload([task("old")]), "old-request", initialFilters),
    );

    expect(state.list.items.map((t) => t.id)).toEqual(["new"]);
  });

  it("bumps the version after create/update/delete so pages refetch", () => {
    let state = reducer(initial, createTask.fulfilled(task("1"), "r1", {}));
    state = reducer(state, updateTask.fulfilled(task("1"), "r2", {}));
    state = reducer(state, deleteTask.fulfilled("1", "r3", "1"));
    expect(state.version).toBe(3);
  });

  it("updates and removes tasks in the loaded lists right away", () => {
    let state = {
      ...initial,
      list: { ...initial.list, items: [task("1"), task("2")] },
      recent: { ...initial.recent, items: [task("1")] },
    };

    state = reducer(state, updateTask.fulfilled(task("1", "Renamed"), "r1", {}));
    expect(state.list.items[0].title).toBe("Renamed");
    expect(state.recent.items[0].title).toBe("Renamed");

    state = reducer(state, deleteTask.fulfilled("1", "r2", "1"));
    expect(state.list.items.map((t) => t.id)).toEqual(["2"]);
    expect(state.recent.items).toEqual([]);
  });

  it("drops a task that no longer exists on the server (404)", () => {
    let state = {
      ...initial,
      list: { ...initial.list, items: [task("1"), task("2")] },
      calendar: { ...initial.calendar, items: [task("1")] },
    };
    const notFound = { status: 404, message: "Task not found" };

    state = reducer(
      state,
      updateTask.rejected(null, "r1", { id: "1", changes: { status: "Completed" } }, notFound),
    );
    expect(state.list.items.map((t) => t.id)).toEqual(["2"]);
    expect(state.calendar.items).toEqual([]);
    expect(state.version).toBe(1);

    state = reducer(state, deleteTask.rejected(null, "r2", "2", notFound));
    expect(state.list.items).toEqual([]);
    expect(state.version).toBe(2);

    // other errors leave the lists alone
    const before = { ...state, list: { ...state.list, items: [task("3")] } };
    const after = reducer(before, deleteTask.rejected(null, "r3", "3", { status: 500 }));
    expect(after.list.items.map((t) => t.id)).toEqual(["3"]);
  });

  it("clears everything on logout", () => {
    const state = reducer(
      { ...initial, version: 5, list: { ...initial.list, items: [task("1")] } },
      logout.fulfilled(null, "r1"),
    );
    expect(state).toEqual(initial);
  });
});
