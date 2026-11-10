import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, CheckCircle2, ClipboardList, Clock3, ListTodo, Plus } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import ProgressCard from "../components/dashboard/ProgressCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import TaskTable from "../components/tasks/TaskTable";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import RefreshError from "../components/ui/RefreshError";
import useTaskActions from "../hooks/useTaskActions";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  fetchRecentTasks,
  fetchTaskStats,
  resetFilters,
  showTasks,
} from "../redux/slices/taskSlice";
import { fetchActivity } from "../redux/slices/activitySlice";

function Dashboard() {
  useDocumentTitle("Dashboard");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stats = useSelector((state) => state.tasks.stats);
  const recent = useSelector((state) => state.tasks.recent);
  const activity = useSelector((state) => state.activity);
  const version = useSelector((state) => state.tasks.version);
  const { openCreate, openEdit, requestDelete, toggleComplete, modals } = useTaskActions();

  useEffect(() => {
    const recentRequest = dispatch(fetchRecentTasks());
    const activityRequest = dispatch(fetchActivity(6));
    return () => {
      recentRequest.abort();
      activityRequest.abort();
    };
  }, [dispatch, version]);

  const openTaskList = (filters) => {
    dispatch(showTasks(filters));
    navigate("/tasks");
  };

  const data = stats.data;
  const statsLoading = !data && stats.status !== "failed";
  const statsFailed = !data && stats.status === "failed";

  const cards = [
    {
      title: "Total Tasks",
      value: data?.total,
      description: data ? `${data.byStatus.Pending} still pending` : "",
      icon: ListTodo,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      filters: {},
    },
    {
      title: "Completed",
      value: data?.byStatus.Completed,
      description: data ? `${data.completionRate}% of all tasks` : "",
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      filters: { status: "Completed" },
    },
    {
      title: "In Progress",
      value: data?.byStatus["In Progress"],
      description: "currently active",
      icon: Clock3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      filters: { status: "In Progress" },
    },
    {
      title: "Overdue",
      value: data?.overdue,
      description: !data
        ? ""
        : data.dueToday
          ? `${data.dueToday} more due today`
          : "past their due date",
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      filters: { overdue: true },
    },
  ];

  const recentLoading = recent.status !== "succeeded" && recent.status !== "failed";

  return (
    <div className="space-y-6 lg:space-y-8">
      {statsFailed && (
        <RefreshError
          className=""
          message="Couldn't load your task counts."
          onRetry={() => dispatch(fetchTaskStats())}
        />
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {cards.map(({ filters, ...card }) => (
          <StatCard
            key={card.title}
            {...card}
            isLoading={statsLoading}
            onClick={() => openTaskList(filters)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProgressCard stats={data} isLoading={statsLoading} />
        <RecentActivity
          className="lg:col-span-2"
          items={activity.items}
          status={activity.status}
          error={activity.error}
          onRetry={() => dispatch(fetchActivity(6))}
        />
      </div>

      <section className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Tasks</h2>
            <p className="text-sm text-gray-400 mt-1">The last few tasks you added</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/tasks"
              onClick={() => dispatch(resetFilters())}
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              View all
            </Link>
            <Button onClick={() => openCreate()}>
              <Plus size={16} />
              Add Task
            </Button>
          </div>
        </div>

        {recent.status === "failed" && recent.items.length > 0 && (
          <RefreshError onRetry={() => dispatch(fetchRecentTasks())} />
        )}

        {recent.status === "failed" && recent.items.length === 0 ? (
          <ErrorState message={recent.error} onRetry={() => dispatch(fetchRecentTasks())} />
        ) : (
          <TaskTable
            tasks={recent.items}
            isLoading={recentLoading && recent.items.length === 0}
            isRefreshing={recentLoading && recent.items.length > 0}
            onEditTask={openEdit}
            onDeleteTask={requestDelete}
            onToggleComplete={toggleComplete}
            emptyState={
              <EmptyState
                icon={ClipboardList}
                title="No tasks yet"
                description="Create your first task and it will show up here."
                action={
                  <Button onClick={() => openCreate()}>
                    <Plus size={16} />
                    Create a task
                  </Button>
                }
              />
            }
          />
        )}
      </section>

      {modals}
    </div>
  );
}

export default Dashboard;
