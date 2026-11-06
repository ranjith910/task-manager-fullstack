import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import authService from "../services/authService";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../services/authService", () => ({
  default: { login: vi.fn() },
}));

const loggedOut = { auth: { user: null, initialized: true } };

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks for email and password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { preloadedState: loggedOut });

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("shows the error from the API", async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue({
      response: { status: 401, data: { message: "Invalid email or password" } },
    });
    renderWithProviders(<Login />, { preloadedState: loggedOut });

    await user.type(screen.getByLabelText("Email"), "me@example.com");
    await user.type(screen.getByLabelText("Password", { selector: "input" }), "wrongpass1");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });

  it("stores the user after a successful login", async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({
      id: "1",
      name: "Ranjith Kumar",
      email: "me@example.com",
    });
    const { store } = renderWithProviders(<Login />, { preloadedState: loggedOut });

    await user.type(screen.getByLabelText("Email"), "  me@example.com ");
    await user.type(screen.getByLabelText("Password", { selector: "input" }), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(authService.login).toHaveBeenCalledWith({
      email: "me@example.com",
      password: "password123",
    });
    expect(store.getState().auth.user.name).toBe("Ranjith Kumar");
  });
});
