import NotFound from "#/pages/NotFound";
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

function setup() {
  return render({
    routes: [
      {
        path: "/",
        element: <NotFound />
      },
      {
        path: "/my-page",
        element: <>My Page</>
      }
    ],
    memoryRouter: {
      initialEntries: ["/"]
    }
  });
}

describe("Pages > NotFound", () => {
  it("deve renderizar o container", () => {
    setup();
  });

  it("deve renderizar os textos no container", () => {
    setup();
    expect(screen.getByText("Página não encontrada")).toBeDefined();
    expect(screen.getByText("Voltar para o início")).toBeDefined();
    expect(screen.getByText("Essa página não existe.")).toBeDefined();
  });

  it("deve voltar para a origem", () => {
    setup();

    const buttonBack = screen.getByTestId("not-found-button-back");

    fireEvent.click(buttonBack);
    expect(mockNavigate).toBeCalledWith("/");
  });
});
