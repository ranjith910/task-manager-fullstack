import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList, Plus, SearchX } from "lucide-react";
import TaskTable from "../components/tasks/TaskTable";
import TaskFilters from "../components/tasks/TaskFilters";
import Pagination from "../components/ui/Pagination";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import RefreshError from "../components/ui/RefreshError";
import useDebounce from "../hooks/useDebounce";
import useTaskActions from "../hooks/useTaskActions";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { fetchTasks, resetFilters, setFilters, setSearch } from "../redux/slices/taskSlice";
import { PAGE_SIZES } from "../utils/constants";

function MyTasks() {
  useDocumentTitle("My Tasks");
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.tasks.filters);
  const { items, pagination, status, error } = useSelector((state) => state.tasks.list);
  const version = useSelector((state) => state.tasks.version);
  const { openCreate, openEdit, requestDelete, toggleComplete, modals } = useTaskActions();

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const [retryCount, setRetryCount] = useState(0);

  // if the search gets changed from outside this page (e.g. notifications), update the input
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    if (filters.search !== debouncedSearch) setSearchInput(filters.search);
  }

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [dispatch, debouncedSearch]);

  useEffect(() => {
    const request = dispatch(fetchTasks(filters));
    return () => request.abort();
  }, [dispatch, filters, version, retryCount]);

  // e.g. after deleting the only task on the last page
  useEffect(() => {
    if (pagination && filters.page > pagination.totalPages) {
      dispatch(setFilters({ page: pagination.totalPages }));
    }
  }, [dispatch, pagination, filters.page]);

  const handleReset = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const hasFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.overdue,
  );
  // a page past the end is about to be corrected by the effect above, treat it as loading
  const isOutOfRange = Boolean(pagination) && filters.page > pagination.totalPages;
  const isLoading = (status !== "succeeded" && status !== "failed") || isOutOfRange;
  const total = pagination?.total ?? 0;
  const firstShown = (filters.page - 1) * filters.limit + 1;
  const lastShown = Math.min(filters.page * filters.limit, total);

  return (
    <>
      <section className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 sm:p-6 pb-0 sm:pb-0 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">All tasks</h2>
            <p className="text-sm text-gray-400 mt-1" aria-live="polite">
              {pagination
                ? `${total} ${total === 1 ? "task" : "tasks"}${hasFilters ? " found" : ""}`
                : "Loading..."}
            </p>
          </div>
          <Button onClick={() => openCreate()}>
            <Plus size={16} />
            New Task
          </Button>
        </div>

        <TaskFilters
          filters={filters}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onChange={(changes) => dispatch(setFilters(changes))}
          onReset={handleReset}
        />

        {status === "failed" && items.length > 0 && (
          <RefreshError onRetry={() => setRetryCount((count) => count + 1)} />
        )}

        {status === "failed" && items.length === 0 ? (
          <ErrorState message={error} onRetry={() => setRetryCount((count) => count + 1)} />
        ) : (
          <TaskTable
            tasks={items}
            isLoading={isLoading && items.length === 0}
            isRefreshing={isLoading && items.length > 0}
            onEditTask={openEdit}
            onDeleteTask={requestDelete}
            onToggleComplete={toggleComplete}
            emptyState={
              hasFilters ? (
                <EmptyState
                  icon={SearchX}
                  title="No tasks match your filters"
                  description="Try a different search or clear the filters."
                  action={
                    <Button variant="secondary" onClick={handleReset}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="No tasks yet"
                  description="Tasks you create will show up here."
                  action={
                    <Button onClick={() => openCreate()}>
                      <Plus size={16} />
                      Create a task
                    </Button>
                  }
                />
              )
            }
          />
        )}

        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>
                Showing {firstShown}-{lastShown} of {total}
              </span>
              <select
                value={filters.limit}
                onChange={(e) => dispatch(setFilters({ limit: Number(e.target.value) }))}
                aria-label="Tasks per page"
                className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-600"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
            <Pagination
              page={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => dispatch(setFilters({ page }))}
            />
          </div>
        )}
      </section>

      {modals}
    </>
  );
}

export default MyTasks;
