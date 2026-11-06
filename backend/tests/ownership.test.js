const { createLoggedInUser, createTask } = require("./helpers");
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

describe("task ownership", () => {
  let alice;
  let bob;
  let aliceTask;

  beforeEach(async () => {
    alice = await createLoggedInUser({ name: "Alice" });
    bob = await createLoggedInUser({ name: "Bob" });
    aliceTask = await createTask(alice.agent, { title: "Alice's private task" });
  });

  it("only lists the user's own tasks", async () => {
    await createTask(bob.agent, { title: "Bob's task" });

    const res = await bob.agent.get("/api/tasks").expect(200);
    assert.deepEqual(
      res.body.data.map((task) => task.title),
      ["Bob's task"],
    );
  });

  it("does not let another user read, update or delete the task", async () => {
    await bob.agent.get(`/api/tasks/${aliceTask.id}`).expect(404);
    await bob.agent.patch(`/api/tasks/${aliceTask.id}`).send({ title: "hacked" }).expect(404);
    await bob.agent.delete(`/api/tasks/${aliceTask.id}`).expect(404);

    const res = await alice.agent.get(`/api/tasks/${aliceTask.id}`).expect(200);
    assert.equal(res.body.data.title, "Alice's private task");
  });

  it("keeps stats and activity separate per user", async () => {
    const stats = await bob.agent.get("/api/tasks/stats").expect(200);
    assert.equal(stats.body.data.total, 0);

    const activity = await bob.agent.get("/api/activity").expect(200);
    assert.deepEqual(activity.body.data, []);
  });
});
