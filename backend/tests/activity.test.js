const { createLoggedInUser, createTask } = require("./helpers");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

describe("GET /api/activity", () => {
  it("records task events, newest first", async () => {
    const { agent } = await createLoggedInUser();
    const task = await createTask(agent, { title: "Ship v1" });

    await agent.patch(`/api/tasks/${task.id}`).send({ status: "In Progress" }).expect(200);
    await agent.patch(`/api/tasks/${task.id}`).send({ description: "with docs" }).expect(200);
    await agent.patch(`/api/tasks/${task.id}`).send({ status: "Completed" }).expect(200);
    await agent.delete(`/api/tasks/${task.id}`).expect(200);

    const res = await agent.get("/api/activity").expect(200);
    const activity = res.body.data;

    assert.deepEqual(
      activity.map((a) => a.action),
      ["deleted", "completed", "updated", "status_changed", "created"],
    );
    assert.deepEqual(activity[3].meta, { from: "Pending", to: "In Progress" });
    assert.ok(activity.every((a) => a.taskTitle === "Ship v1"));
  });

  it("does not log an update that changes nothing", async () => {
    const { agent } = await createLoggedInUser();
    const task = await createTask(agent, { title: "Same" });

    await agent.patch(`/api/tasks/${task.id}`).send({ title: "Same" }).expect(200);

    const res = await agent.get("/api/activity");
    assert.equal(res.body.data.length, 1);
  });

  it("respects the limit", async () => {
    const { agent } = await createLoggedInUser();
    await createTask(agent);
    await createTask(agent);
    await createTask(agent);

    const res = await agent.get("/api/activity?limit=2").expect(200);
    assert.equal(res.body.data.length, 2);

    await agent.get("/api/activity?limit=500").expect(400);
  });
});
