import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { loggedInState, renderWithProviders } from "../../test/renderWithProviders";

const routes = (
  <Routes>
    <Route element={<GuestRoute />}>
      <Route path="/login" element={<p>Login page</p>} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route path="/tasks" element={<p>Tasks page</p>} />
    </Route>
  </Routes>
);

describe("route guards", () => {
  it("sends logged out users to /login", () => {
    renderWithProviders(routes, {
      route: "/tasks",
      preloadedState: { auth: { user: null, initialized: true } },
    });
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("lets logged in users through", () => {
    renderWithProviders(routes, { route: "/tasks", preloadedState: loggedInState() });
    expect(screen.getByText("Tasks page")).toBeInTheDocument();
  });

  it("keeps logged in users away from /login", () => {
    renderWithProviders(routes, { route: "/login", preloadedState: loggedInState() });
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});
