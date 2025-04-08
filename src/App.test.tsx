import { render, screen, renderHook } from "@testing-library/react";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import { vi } from "vitest";
import App from "./App";

vi.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: vi.fn(() => "fake-access-token"),
  useOidc: vi.fn(() => ({
    logout: vi.fn()
  }))
}));

vi.mock("#/routes/routes", () => ({
  Routes: () => <div data-testid="routes" />
}));

describe("App Component", () => {
  beforeEach(() => {
    global.window.auth = {
      token: "mocked-token",
      user: { name: "Mock User" },
      actions: { logout: vi.fn() }
    };
  });
  it("deve utilizar um token mocado", () => {
    const { result } = renderHook(() => useOidcAccessToken());
    expect(result.current).toBe("fake-access-token");
  });

  it("deve utilizar o oidc mocado", () => {
    const { result } = renderHook(() => useOidc());
    expect(result.current).toHaveProperty("logout");
  });

  it("deve renderizar o componente App corretamente", () => {
    render(<App />);

    expect(screen.getByTestId("routes")).toBeInTheDocument();
  });
});
