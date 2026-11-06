function TaskTable({ tasks, onAddTask, onEditTask, onDeleteTask }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Recent Tasks</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage and track your latest tasks
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          + Add Task
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                Task
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                Due Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                Priority
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {task.description}
                  </p>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {task.dueDate}
                </td>

                <td className="px-6 py-4">
                  <PriorityBadge priority={task.priority} />
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={task.status} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEditTask(task)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-orange-50 text-orange-600",
    Low: "bg-green-50 text-green-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-green-50 text-green-600",
    "In Progress": "bg-blue-50 text-blue-600",
    Pending: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default TaskTable;
