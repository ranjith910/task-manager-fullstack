import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import taskService from "../../services/taskService";
import { createApiThunk } from "../createApiThunk";
import { logout, sessionExpired } from "./authSlice";

export const initialFilters = {
  search: "",
  status: "",
  priority: "",
  overdue: false,
  sort: "-createdAt",
  page: 1,
  limit: 10,
};

const requestState = (data) => ({ status: "idle", error: null, requestId: null, ...data });

const initialState = {
  filters: initialFilters,
  list: requestState({ items: [], pagination: null }), // My Tasks page
  recent: requestState({ items: [] }), // dashboard table
  calendar: requestState({ items: [], total: 0 }),
  stats: requestState({ data: null }),
  // bumped after every create/update/delete, pages refetch when it changes
  version: 0,
};

const toQueryParams = ({ overdue, ...filters }) => ({
  ...filters,
  overdue: overdue ? "true" : undefined,
});

export const fetchTasks = createApiThunk("tasks/fetchTasks", (filters, signal) =>
  taskService.getTasks(toQueryParams(filters), signal),
);

export const fetchRecentTasks = createApiThunk("tasks/fetchRecentTasks", (_arg, signal) =>
  taskService.getTasks({ limit: 5, sort: "-createdAt" }, signal),
);

const CALENDAR_PAGE_SIZE = 100;
const CALENDAR_MAX_PAGES = 5;

// the API pages at 100, so load the rest of the visible weeks too (up to 500 tasks)
export const fetchCalendarTasks = createApiThunk(
  "tasks/fetchCalendarTasks",
  async ({ from, to }, signal) => {
    const params = { dueFrom: from, dueTo: to, sort: "dueDate", limit: CALENDAR_PAGE_SIZE };
    const first = await taskService.getTasks({ ...params, page: 1 }, signal);

    const lastPage = Math.min(first.pagination.totalPages, CALENDAR_MAX_PAGES);
    if (lastPage === 1) return first;

    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) =>
        taskService.getTasks({ ...params, page: i + 2 }, signal),
      ),
    );
    return { ...first, data: [first, ...rest].flatMap((page) => page.data) };
  },
);

export const fetchTaskStats = createApiThunk("tasks/fetchTaskStats", (_arg, signal) =>
  taskService.getStats(signal),
);

export const createTask = createApiThunk("tasks/createTask", (task) =>
  taskService.createTask(task),
);

export const updateTask = createApiThunk("tasks/updateTask", ({ id, changes }) =>
  taskService.updateTask(id, changes),
);

export const deleteTask = createApiThunk("tasks/deleteTask", (id) => taskService.deleteTask(id));

// Same pending/fulfilled/rejected handling for every fetch. Only the response of the
// latest request is kept, so a slow old search can't overwrite a newer one.
const addFetchCases = (builder, thunk, key, saveResult) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      state[key].status = "loading";
      state[key].error = null;
      state[key].requestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return;
      state[key].status = "succeeded";
      saveResult(state[key], action.payload);
    })
    .addCase(thunk.rejected, (state, action) => {
      if (action.meta.aborted || state[key].requestId !== action.meta.requestId) return;
      state[key].status = "failed";
      state[key].error = action.payload?.message || "Something went wrong";
    });
};

const TASK_LISTS = ["list", "recent", "calendar"];

const removeTask = (state, id) => {
  for (const key of TASK_LISTS) {
    state[key].items = state[key].items.filter((task) => task.id !== id);
  }
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // changing any filter goes back to page 1, unless the page is what changed
    setFilters(state, action) {
      state.filters = { ...state.filters, page: 1, ...action.payload };
    },
    // no-op when unchanged, so the debounced search box doesn't reset the page on mount
    setSearch(state, action) {
      if (state.filters.search === action.payload) return;
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    // start from clean filters, e.g. when clicking "Overdue" on the dashboard
    showTasks(state, action) {
      state.filters = { ...initialFilters, limit: state.filters.limit, ...action.payload };
    },
    resetFilters(state) {
      state.filters = { ...initialFilters, limit: state.filters.limit };
    },
  },
  extraReducers: (builder) => {
    addFetchCases(builder, fetchTasks, "list", (slot, payload) => {
      slot.items = payload.data;
      slot.pagination = payload.pagination;
    });
    addFetchCases(builder, fetchRecentTasks, "recent", (slot, payload) => {
      slot.items = payload.data;
    });
    addFetchCases(builder, fetchCalendarTasks, "calendar", (slot, payload) => {
      slot.items = payload.data;
      slot.total = payload.pagination.total;
    });
    addFetchCases(builder, fetchTaskStats, "stats", (slot, payload) => {
      slot.data = payload;
    });

    // update the visible lists right away, the refetch triggered by `version` follows
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        for (const key of TASK_LISTS) {
          const index = state[key].items.findIndex((task) => task.id === action.payload.id);
          if (index !== -1) state[key].items[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        removeTask(state, action.payload);
      })
      // 404 = the task is already gone (deleted in another tab, demo data reset...),
      // so drop it here as well instead of leaving a row that can't be used
      .addCase(updateTask.rejected, (state, action) => {
        if (action.payload?.status === 404) {
          removeTask(state, action.meta.arg.id);
          state.version += 1;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        if (action.payload?.status === 404) {
          removeTask(state, action.meta.arg);
          state.version += 1;
        }
      })
      .addMatcher(
        isAnyOf(createTask.fulfilled, updateTask.fulfilled, deleteTask.fulfilled),
        (state) => {
          state.version += 1;
        },
      )
      .addMatcher(isAnyOf(logout.fulfilled, logout.rejected, sessionExpired), () => initialState);
  },
});

export const { setFilters, setSearch, showTasks, resetFilters } = taskSlice.actions;
export default taskSlice.reducer;
