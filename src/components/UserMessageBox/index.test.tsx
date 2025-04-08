import { fireEvent, render, screen, waitFor } from "#/utils/testUtils";
import { describe, it, vi } from "vitest";
import useMessageStore from "#/stores/messagesStore";
import { UserMessage } from ".";
import { message } from "#/utils/mock/mockChat";

const mockNavigate = vi.fn();

vi.mock("#/constants", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    APPLICATION: vi.fn().mockReturnValue({ BFF_URL: "" })
  };
});

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// vi.mock("#/utils/apis", () => ({
//   postResponseChat: vi.fn()
// }));

vi.mock("#/stores/filtersStore", async () => {
  const actual: any = await vi.importActual("#/stores/filtersStore");
  return {
    ...actual,
    useFilterStore: vi.fn(() => ({
      filters: [],
      setFilters: vi.fn()
    }))
  };
});

vi.mock("#/stores/messagesStore", async () => {
  const actual: any = await vi.importActual("#/stores/messagesStore");
  return {
    ...actual,
    useMessageStore: vi.fn(() => ({
      messages: [],
      addMessage: vi.fn(),
      cleanMessages: vi.fn()
    }))
  };
});

vi.mock("#/utils/apis");

function setup() {
  const setMessageToFavorite = vi.fn();
  return render({
    routes: [
      {
        path: "/",
        element: (
          <UserMessage
            text={message.text}
            fileName={message.file?.name}
            setMessageToFavorite={setMessageToFavorite}
          ></UserMessage>
        )
      }
    ],
    memoryRouter: { initialIndex: 1 }
  });
}

vi.mock("../../stores/userStore", async () => {
  const actual: any = await vi.importActual("../../stores/userStore");
  return {
    ...actual,
    useUserStore: vi.fn(() => ({
      user: {
        created_at: "2023-01-01",
        id_dominio: [],
        ldap: "user_ldap",
        super_admin: true,
        updated_at: "2023-01-01",
        nomeEntidade: "Entidade Teste"
      },
      setUser: vi.fn()
    }))
  };
});

describe("Pages > Chat", () => {
  beforeEach(() => {
    vi.mock("@axa-fr/react-oidc", () => ({
      useOidcAccessToken: () => "fake-access-token",
      useOidc: () => ({
        logout: () => ({})
      })
    }));
  });

  it("deve renderizar a mensagem do usuário", async () => {
    useMessageStore.setState({ messages: [message] });
    setup();
    const userMessage = screen.getByTestId("user-message-box");
    expect(userMessage).toBeInTheDocument();
  });

  it("Aparece o toolbar ao passar o mouse sobre o texto", async () => {
    useMessageStore.setState({ messages: [message] });
    setup();
    const userMessage = screen.getByTestId("user-message-text");
    expect(userMessage).toBeInTheDocument();

    // Simula o evento de mouse sobre a mensagem do usuário
    fireEvent.mouseEnter(userMessage);

    // Aguarda que a barra de ferramentas apareça no DOM
    await waitFor(() => {
      const toolbar = screen.queryByTestId("toolbar-user-message");
      expect(toolbar).toBeInTheDocument();
    });

    // Simula o evento de mouse saindo da mensagem do usuário
    fireEvent.mouseLeave(userMessage);

    // Verifica se a barra de ferramentas não está visível
    await waitFor(() => {
      const toolbar = screen.queryByTestId("toolbar-user-message");
      expect(toolbar).not.toBeInTheDocument();
    });
  });
});
