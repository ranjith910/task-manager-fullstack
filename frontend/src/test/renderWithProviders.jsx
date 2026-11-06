import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { setupStore } from "../redux/store";

export function renderWithProviders(ui, { preloadedState, route = "/", store } = {}) {
  const testStore = store ?? setupStore(preloadedState);

  return {
    store: testStore,
    ...render(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  };
}

export const loggedInState = (user = {}) => ({
  auth: {
    initialized: true,
    user: {
      id: "u1",
      name: "Ranjith Kumar",
      email: "ranjith@example.com",
      role: "user",
      createdAt: "2026-11-01T10:00:00.000Z",
      ...user,
    },
  },
});
