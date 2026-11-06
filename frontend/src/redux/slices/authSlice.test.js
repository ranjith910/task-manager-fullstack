import { describe, expect, it } from "vitest";
import reducer, { fetchCurrentUser, logout } from "./authSlice";

const initial = reducer(undefined, { type: "init" });
const user = { id: "1", name: "Ranjith Kumar", email: "ranjith@example.com" };

describe("authSlice session check", () => {
  it("stores the user when the cookie is valid", () => {
    const state = reducer(initial, fetchCurrentUser.fulfilled(user, "r1"));
    expect(state).toMatchObject({ user, initialized: true, sessionError: null });
  });

  it("treats a 401 as logged out", () => {
    const state = reducer(
      initial,
      fetchCurrentUser.rejected(null, "r1", undefined, {
        status: 401,
        message: "You are not logged in",
      }),
    );
    expect(state).toMatchObject({ user: null, initialized: true, sessionError: null });
  });

  it("does not log the user out when the server can't be reached", () => {
    const state = reducer(
      initial,
      fetchCurrentUser.rejected(null, "r1", undefined, {
        status: null,
        message: "The request took too long, please try again",
      }),
    );
    expect(state.initialized).toBe(false);
    expect(state.sessionError).toBe("The request took too long, please try again");

    // retrying clears the error while the request is in flight
    expect(reducer(state, fetchCurrentUser.pending("r2")).sessionError).toBeNull();
  });

  it("clears the user on logout, even if the request failed", () => {
    const loggedIn = reducer(initial, fetchCurrentUser.fulfilled(user, "r1"));
    expect(reducer(loggedIn, logout.fulfilled(null, "r2")).user).toBeNull();
    expect(
      reducer(loggedIn, logout.rejected(null, "r3", undefined, { message: "x" })).user,
    ).toBeNull();
  });
});
