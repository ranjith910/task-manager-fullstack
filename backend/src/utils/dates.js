// Due dates are calendar days ("YYYY-MM-DD"). They're stored as midnight UTC
// so overdue / due today checks don't depend on the server's timezone.

const isValidDateOnly = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  // also catches dates like 2026-02-30 that JS would roll over into March
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const parseDateOnly = (value) => new Date(`${value}T00:00:00.000Z`);

const todayUtc = () => parseDateOnly(new Date().toISOString().slice(0, 10));

module.exports = { isValidDateOnly, parseDateOnly, todayUtc };
