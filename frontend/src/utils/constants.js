export const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
export const TASK_PRIORITIES = ["Low", "Medium", "High"];

export const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "dueDate", label: "Due date (soonest)" },
  { value: "-dueDate", label: "Due date (latest)" },
  { value: "-priority", label: "Priority (high to low)" },
  { value: "priority", label: "Priority (low to high)" },
  { value: "title", label: "Title (A to Z)" },
];

export const PAGE_SIZES = [10, 20, 50];
