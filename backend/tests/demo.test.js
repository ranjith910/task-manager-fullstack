const { app, request, createLoggedInUser, createTask } = require("./helpers");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/User");
const Task = require("../src/models/Task");
const { resetDemoAccount } = require("../src/services/demoService");

const loginAsDemo = () =>
  request(app).post("/api/auth/login").send({ email: "demo@tasknix.app", password: "demo1234" });

describe("resetDemoAccount", () => {
  it("creates the demo account with sample data", async () => {
    const { taskCount } = await resetDemoAccount();

    const res = await loginAsDemo().expect(200);
    const user = await User.findById(res.body.data.id);
    assert.equal(await Task.countDocuments({ user: user._id }), taskCount);
    assert.ok(taskCount > 10);
  });

  it("puts the demo data back without touching other users", async () => {
    await resetDemoAccount();
    const other = await createLoggedInUser();
    await createTask(other.agent, { title: "Not demo data" });

    // a visitor messes with the demo tasks
    const demo = request.agent(app);
    await demo.post("/api/auth/login").send({ email: "demo@tasknix.app", password: "demo1234" });
    const list = await demo.get("/api/tasks?limit=100");
    for (const task of list.body.data) {
      await demo.delete(`/api/tasks/${task.id}`).expect(200);
    }

    const { taskCount } = await resetDemoAccount();

    const after = await demo.get("/api/tasks?limit=100").expect(200);
    assert.equal(after.body.data.length, taskCount);
    assert.equal(await User.countDocuments({ email: "demo@tasknix.app" }), 1);

    const otherTasks = await other.agent.get("/api/tasks").expect(200);
    assert.deepEqual(
      otherTasks.body.data.map((task) => task.title),
      ["Not demo data"],
    );
  });
});
