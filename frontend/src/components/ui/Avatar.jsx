const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function Avatar({ name, size = "w-9 h-9 text-sm" }) {
  return (
    <span
      aria-hidden="true"
      className={`${size} shrink-0 rounded-full bg-indigo-100 text-indigo-600 font-semibold flex items-center justify-center`}
    >
      {getInitials(name) || "?"}
    </span>
  );
}

export default Avatar;
