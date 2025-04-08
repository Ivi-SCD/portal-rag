import Fallback from ".";
import { render, screen } from "#/utils/testUtils";
import { describe, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const error = new Error();
error.message = "Erro de Fallback";

function setup() {
  return render({
    routes: [
      {
        path: "/",
        element: <Fallback error={error} resetErrorBoundary={() => {}} />
      }
    ],
    memoryRouter: {
      initialEntries: ["/"]
    }
  });
}

describe("Pages > Rota Root", () => {
  it("deve renderizar o container", () => {
    setup();
  });

  it("deve renderizar os textos no container", async () => {
    setup();

    expect(screen.getByText("Erro de Fallback")).toBeDefined();
  });
});
