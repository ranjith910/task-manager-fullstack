const express = require("express");
const { z } = require("zod");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { getActivity } = require("../controllers/activityController");

const router = express.Router();

const activityQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be between 1 and 50")
    .max(50, "Limit must be between 1 and 50")
    .default(10),
});

router.get("/", protect, validate({ query: activityQuerySchema }), getActivity);

module.exports = router;
