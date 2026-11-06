// Turns an axios error into { status, message, errors } so the UI has one shape to deal with.
export const getApiError = (error) => {
  const status = error.response?.status ?? null;
  const data = error.response?.data;

  if (data?.message) {
    return { status, message: data.message, errors: data.errors || [] };
  }
  if (error.response) {
    return { status, message: "Something went wrong, please try again", errors: [] };
  }
  if (error.code === "ECONNABORTED") {
    return { status, message: "The request took too long, please try again", errors: [] };
  }
  return { status, message: "Can't reach the server, check your connection", errors: [] };
};

// [{ field: "email", message: "..." }] -> { email: "..." }
export const toFieldErrors = (errors = []) =>
  Object.fromEntries(
    errors.filter((error) => error.field).map((error) => [error.field, error.message]),
  );
