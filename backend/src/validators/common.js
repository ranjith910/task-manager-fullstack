const { z } = require("zod");
const mongoose = require("mongoose");
const { isValidDateOnly } = require("../utils/dates");

const objectId = (label = "id") =>
  z.string().refine((value) => mongoose.isValidObjectId(value), `Invalid ${label}`);

const dateOnly = (label = "Date") =>
  z.string().refine(isValidDateOnly, `${label} must be a valid date (YYYY-MM-DD)`);

const idParamSchema = z.object({ id: objectId("task id") });

module.exports = { objectId, dateOnly, idParamSchema };
