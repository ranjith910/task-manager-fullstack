const { app, request, createLoggedInUser, createTask } = require("./helpers");
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const titles = (res) => res.body.data.map((task) => task.title);

describe("task CRUD", () => {
  let agent;

  beforeEach(async () => {
    ({ agent } = await createLoggedInUser());
  });

  it("creates a task with defaults", async () => {
    const res = await agent
      .post("/api/tasks")
      .send({ title: "  Write README  ", dueDate: "2026-12-01" })
      .expect(201);

    const task = res.body.data;
    assert.equal(task.title, "Write README");
    assert.equal(task.description, "");
    assert.equal(task.status, "Pending");
    assert.equal(task.priority, "Medium");
    assert.equal(task.dueDate, "2026-12-01T00:00:00.000Z");
    assert.equal(task.completedAt, null);
    assert.ok(task.id);
    assert.equal(task._id, undefined);
  });

  it("validates the body", async () => {
    const res = await agent
      .post("/api/tasks")
      .send({ title: "", status: "Done", priority: "Urgent", dueDate: "2026-02-30" })
      .expect(400);

    const fields = res.body.errors.map((e) => e.field).sort();
    assert.deepEqual(fields, ["dueDate", "priority", "status", "title"]);
  });

  it("rejects fields the server owns", async () => {
    const res = await agent
      .post("/api/tasks")
      .send({ title: "x", dueDate: "2026-12-01", user: "507f1f77bcf86cd799439011" })
      .expect(400);

    assert.equal(res.body.errors[0].field, "user");
  });

  it("gets, updates and deletes a task", async () => {
    const task = await createTask(agent, { title: "Original" });

    const fetched = await agent.get(`/api/tasks/${task.id}`).expect(200);
    assert.equal(fetched.body.data.title, "Original");

    const updated = await agent
      .patch(`/api/tasks/${task.id}`)
      .send({ title: "Renamed", priority: "High" })
      .expect(200);
    assert.equal(updated.body.data.title, "Renamed");
    assert.equal(updated.body.data.priority, "High");
    assert.equal(updated.body.data.status, "Pending");

    await agent.delete(`/api/tasks/${task.id}`).expect(200);
    await agent.get(`/api/tasks/${task.id}`).expect(404);
  });

  it("sets completedAt when completed and clears it when reopened", async () => {
    const task = await createTask(agent);

    const done = await agent.patch(`/api/tasks/${task.id}`).send({ status: "Completed" });
    assert.notEqual(done.body.data.completedAt, null);

    const reopened = await agent.patch(`/api/tasks/${task.id}`).send({ status: "In Progress" });
    assert.equal(reopened.body.data.completedAt, null);
  });

  it("rejects an empty update", async () => {
    const task = await createTask(agent);
    await agent.patch(`/api/tasks/${task.id}`).send({}).expect(400);
  });

  it("returns 400 for a malformed id and 404 for a missing task", async () => {
    await agent.get("/api/tasks/not-an-id").expect(400);
    await agent.patch("/api/tasks/507f1f77bcf86cd799439011").send({ title: "x" }).expect(404);
    await agent.delete("/api/tasks/507f1f77bcf86cd799439011").expect(404);
  });

  it("requires authentication", async () => {
    await request(app).get("/api/tasks").expect(401);
    await request(app).post("/api/tasks").send({ title: "x", dueDate: "2026-12-01" }).expect(401);
  });
});

describe("GET /api/tasks", () => {
  let agent;

  beforeEach(async () => {
    ({ agent } = await createLoggedInUser());

    await createTask(agent, { title: "Fix login bug", priority: "High", dueDate: "2026-11-01" });
    await createTask(agent, {
      title: "Write docs",
      priority: "Low",
      dueDate: "2026-11-10",
      status: "In Progress",
    });
    await createTask(agent, { title: "Deploy (prod)", priority: "Medium", dueDate: "2026-11-20" });
    await createTask(agent, {
      title: "Old done task",
      priority: "High",
      dueDate: "2026-10-01",
      status: "Completed",
    });
  });

  it("paginates", async () => {
    const page1 = await agent.get("/api/tasks?limit=3&page=1").expect(200);
    const page2 = await agent.get("/api/tasks?limit=3&page=2").expect(200);

    assert.equal(page1.body.data.length, 3);
    assert.equal(page2.body.data.length, 1);
    assert.deepEqual(page1.body.pagination, { page: 1, limit: 3, total: 4, totalPages: 2 });
  });

  it("searches title and description, treating input literally", async () => {
    assert.deepEqual(titles(await agent.get("/api/tasks?search=LOGIN")), ["Fix login bug"]);
    assert.deepEqual(titles(await agent.get("/api/tasks?search=(prod")), ["Deploy (prod)"]);
    assert.deepEqual(titles(await agent.get("/api/tasks?search=.*")), []);
  });

  it("filters by status and priority", async () => {
    assert.deepEqual(titles(await agent.get("/api/tasks?status=In Progress")), ["Write docs"]);
    assert.deepEqual(titles(await agent.get("/api/tasks?priority=High&sort=title")), [
      "Fix login bug",
      "Old done task",
    ]);
  });

  it("filters overdue tasks relative to the client's date", async () => {
    const res = await agent.get("/api/tasks?overdue=true&today=2026-11-15").expect(200);
    assert.deepEqual(titles(res).sort(), ["Fix login bug", "Write docs"]);

    const completed = await agent.get("/api/tasks?overdue=true&status=Completed&today=2026-11-15");
    assert.deepEqual(completed.body.data, []);
  });

  it("filters by due date range", async () => {
    const res = await agent.get("/api/tasks?dueFrom=2026-11-01&dueTo=2026-11-10&sort=dueDate");
    assert.deepEqual(titles(res), ["Fix login bug", "Write docs"]);
  });

  it("sorts by priority rank, not alphabetically", async () => {
    const res = await agent.get("/api/tasks?sort=-priority").expect(200);
    assert.deepEqual(
      res.body.data.map((task) => task.priority),
      ["High", "High", "Medium", "Low"],
    );
  });

  it("sorts titles A to Z ignoring case", async () => {
    await createTask(agent, { title: "apple pie recipe" });
    await createTask(agent, { title: "Zoom call notes" });

    const res = await agent.get("/api/tasks?sort=title&limit=20").expect(200);
    assert.deepEqual(titles(res), [
      "apple pie recipe",
      "Deploy (prod)",
      "Fix login bug",
      "Old done task",
      "Write docs",
      "Zoom call notes",
    ]);
  });

  it("rejects invalid query params", async () => {
    await agent.get("/api/tasks?limit=1000").expect(400);
    await agent.get("/api/tasks?sort=password").expect(400);
    await agent.get("/api/tasks?status=Done").expect(400);
    await agent.get("/api/tasks?dueFrom=yesterday").expect(400);
  });
});

describe("GET /api/tasks/stats", () => {
  it("returns counts for the user's tasks", async () => {
    const { agent } = await createLoggedInUser();

    await createTask(agent, { dueDate: "2026-11-01" }); // overdue
    await createTask(agent, { dueDate: "2026-11-06", status: "In Progress" }); // due today
    await createTask(agent, { dueDate: "2026-10-01", status: "Completed", priority: "High" });
    await createTask(agent, { dueDate: "2026-12-01", priority: "Low" });

    const res = await agent.get("/api/tasks/stats?today=2026-11-06").expect(200);

    assert.deepEqual(res.body.data, {
      total: 4,
      byStatus: { Pending: 2, "In Progress": 1, Completed: 1 },
      byPriority: { Low: 1, Medium: 2, High: 1 },
      overdue: 1,
      dueToday: 1,
      completionRate: 25,
    });
  });

  it("returns zeros when there are no tasks", async () => {
    const { agent } = await createLoggedInUser();
    const res = await agent.get("/api/tasks/stats").expect(200);

    assert.equal(res.body.data.total, 0);
    assert.equal(res.body.data.overdue, 0);
    assert.equal(res.body.data.completionRate, 0);
  });
});
