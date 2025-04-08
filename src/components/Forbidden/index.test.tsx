import Forbidden from ".";
import { fireEvent, render, screen } from "#/utils/testUtils";
import { describe, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const handleClose = vi.fn();

function setup() {
  return render({
    routes: [
      {
        path: "/rota-nao-autorizada",
        element: <Forbidden handleClose={handleClose} />
      }
    ],
    memoryRouter: {
      initialEntries: ["/rota-nao-autorizada"]
    }
  });
}

describe("Pages > Rota não autorizada", () => {
  it("deve renderizar o container", () => {
    setup();
  });

  it("deve renderizar os textos no container", async () => {
    setup();

    expect(
      screen.getByText("Você não possui autorização para acessar essa aplicação.")
    ).toBeDefined();
  });

  it("deve executar o handler", () => {
    setup();
    const button = screen.getByTestId("forbidden-button");

    fireEvent.click(button);
    expect(handleClose).toHaveBeenCalled(); // Verifica se handleClose foi chamada
  });
});
