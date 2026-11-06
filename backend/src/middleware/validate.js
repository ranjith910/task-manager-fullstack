const AppError = require("../utils/AppError");

// Validates params/query/body with zod schemas and puts the parsed values on
// req.validated. Controllers only read from there, never from raw req.body.
//
//   router.post("/", validate({ body: createTaskSchema }), createTask)
const validate = (schemas) => (req, _res, next) => {
  const validated = {};
  const issues = [];

  for (const source of ["params", "query", "body"]) {
    if (!schemas[source]) continue;

    const result = schemas[source].safeParse(req[source] ?? {});
    if (result.success) {
      validated[source] = result.data;
    } else {
      issues.push(...result.error.issues);
    }
  }

  if (issues.length) {
    const errors = issues.map((issue) => ({
      // unrecognized_keys issues have an empty path but list the keys
      field: issue.path.join(".") || issue.keys?.join(", ") || null,
      message: issue.message,
    }));
    return next(new AppError(400, "Validation failed", errors));
  }

  req.validated = validated;
  next();
};

module.exports = validate;
