import { useState } from "react";
import CreateTaskModal from "../components/ui/CreateTaskModal";
import TaskTable from "../components/ui/TaskTable";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.iconBg}`}
        >
          <Icon size={22} className={stat.iconColor} />
        </div>

        <ArrowUpRight size={18} className="text-gray-400" />
      </div>

      <p className="text-sm text-gray-500 mt-5">{stat.title}</p>

      <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>

      <p className="text-xs text-gray-400 mt-2">
        <span className="text-green-600 font-medium">{stat.change}</span>{" "}
        {stat.description}
      </p>
    </div>
  );
}

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  // Calculate task statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const overdueTasks = tasks.filter(
    (task) => task.dueDate < todayString && task.status !== "Completed"
  ).length;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      change: "",
      description: "total tasks created",
      icon: ListTodo,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Completed",
      value: completedTasks,
      change: "",
      description: "tasks completed",
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      change: "",
      description: "currently active",
      icon: Clock3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      change: "",
      description: "past due date",
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      // Update existing task
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskData.id ? taskData : task))
      );
    } else {
      // Create new task
      setTasks((prevTasks) => [taskData, ...prevTasks]);
    }

    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your productivity and manage your work.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Progress and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Task Progress</h2>

          <p className="text-sm text-gray-400 mt-1">
            Your overall task completion
          </p>

          <div className="mt-8 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-[12px] border-indigo-100 flex items-center justify-center relative">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800">
                  {totalTasks === 0
                    ? 0
                    : Math.round((completedTasks / totalTasks) * 100)}
                  %
                </h3>
                <p className="text-xs text-gray-400">Completed</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <ProgressItem
              label="Completed"
              value={completedTasks}
              color="bg-green-500"
            />

            <ProgressItem
              label="In Progress"
              value={inProgressTasks}
              color="bg-blue-500"
            />

            <ProgressItem
              label="Pending"
              value={pendingTasks}
              color="bg-gray-300"
            />
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activity
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Your latest workspace activity
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <ActivityItem
              title="Completed API integration"
              time="2 hours ago"
              color="bg-green-500"
            />
            <ActivityItem
              title="Updated dashboard design"
              time="Yesterday"
              color="bg-blue-500"
            />
            <ActivityItem
              title="Created authentication flow"
              time="2 days ago"
              color="bg-indigo-500"
            />
            <ActivityItem
              title="Added task filtering"
              time="3 days ago"
              color="bg-orange-500"
            />
          </div>
        </div>
      </div>

      <TaskTable
        tasks={tasks}
        onAddTask={() => setIsModalOpen(true)}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <CreateTaskModal
        key={editingTask ? editingTask.id : "new"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </div>
  );
}

function ProgressItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        {label}
      </div>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function ActivityItem({ title, time, color }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${color}`} />

      <div>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

export default Dashboard;
