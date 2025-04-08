import Layout from "#/pages/Layout";
import useUserStore from "#/stores/userStore";
import { fireEvent, render, screen } from "#/utils/testUtils";
import { describe, it, vi } from "vitest";

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

// Mock do sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    clear: () => (store = {})
  };
})();

Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mocked-uuid")
}));

const renewSessionId = () => {
  const newSessionId = "mocked-uuid";
  sessionStorage.setItem("sessionId", newSessionId);
};

function setup() {
  return render({
    routes: [
      {
        path: "/",
        element: <Layout />
      }
    ],
    memoryRouter: {
      initialEntries: ["/"]
    }
  });
}

describe("Pages > Layout", () => {
  beforeEach(() => {
    vi.mock("@axa-fr/react-oidc", () => ({
      useOidcAccessToken: () => "fake-access-token",
      useOidc: () => ({
        logout: () => ({})
      })
    }));
  });

  it("deve renderizar o Layout", () => {
    setup();
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  it("deve renderizar o Header", () => {
    setup();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("deve atualizar o uuid", () => {
    renewSessionId();
    expect(sessionStorage.getItem("sessionId")).toBe("mocked-uuid");
  });

  it("deve renderizar a logo e direciona pra home ao clicar nele", () => {
    setup();
    const button = screen.getByTestId("logo-sicredi-layout");
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("deve renderizar o botão dropdown", () => {
    setup();

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);
  });

  it("deve exibir todos os itens do menu ao clicar no botão dropdown", () => {
    setup();
    const user = {
      created_at: "2025-03-20",
      id_dominio: [],
      ldap: "user_ldap",
      super_admin: true,
      updated_at: "2025-03-20",
      nomeEntidade: "Entidade Teste"
    };
    useUserStore.setState({ user });

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);

    expect(screen.queryByText("Domínios")).toBeInTheDocument();
    expect(screen.queryByText("Usuários")).toBeInTheDocument();
    expect(screen.getByText("Prompts")).toBeInTheDocument();
  });

  it("deve exibir apenas Dominios e Usuários ao clicar no botão dropdown", () => {
    setup();
    const user = {
      created_at: "2025-03-20",
      id_dominio: [{ permissao: "admin" as const, dominio: "dominio-teste" }],
      ldap: "user_ldap",
      super_admin: false,
      updated_at: "2025-03-20",
      nomeEntidade: "Entidade Teste"
    };
    useUserStore.setState({ user });

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);

    expect(screen.queryByText("Domínios")).toBeInTheDocument();
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
    expect(screen.getByText("Prompts")).toBeInTheDocument();
  });

  it("deve exibir só Prompts no menu ao clicar no botão dropdown", () => {
    setup();
    const user = {
      created_at: "2025-03-20",
      id_dominio: [{ permissao: "user" as const, dominio: "teste" }],
      ldap: "user_ldap",
      super_admin: false,
      updated_at: "2025-03-20",
      nomeEntidade: "Entidade Teste"
    };
    useUserStore.setState({ user });

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);

    expect(screen.queryByText("Domínios")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
    expect(screen.getByText("Prompts")).toBeInTheDocument();
  });

  it("deve navegar para 'Domínios' ao clicar no item correspondente", () => {
    setup();
    const user = {
      created_at: "2025-03-20",
      id_dominio: [],
      ldap: "user_ldap",
      super_admin: true,
      updated_at: "2025-03-20",
      nomeEntidade: "Entidade Teste"
    };
    useUserStore.setState({ user });

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);

    const dominiosItem = screen.getByText("Domínios");
    fireEvent.click(dominiosItem);

    expect(mockNavigate).toHaveBeenCalledWith("/Dominios");
  });

  it("deve navegar para 'Usuários' ao clicar no item correspondente", () => {
    setup();
    const user = {
      created_at: "2025-03-20",
      id_dominio: [],
      ldap: "user_ldap",
      super_admin: true,
      updated_at: "2025-03-20",
      nomeEntidade: "Entidade Teste"
    };
    useUserStore.setState({ user });

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);

    const dominiosItem = screen.getByText("Usuários");
    fireEvent.click(dominiosItem);

    expect(mockNavigate).toHaveBeenCalledWith("/Usuarios");
  });

  it("deve navegar para 'Prompts' ao clicar no item correspondente", () => {
    setup();
    const user = {
      created_at: "2025-03-20",
      id_dominio: [],
      ldap: "user_ldap",
      super_admin: true,
      updated_at: "2025-03-20",
      nomeEntidade: "Entidade Teste"
    };
    useUserStore.setState({ user });

    const button = screen.getByTestId("dropdown-button");
    fireEvent.click(button);

    const dominiosItem = screen.getByText("Prompts");
    fireEvent.click(dominiosItem);

    expect(mockNavigate).toHaveBeenCalledWith("/Prompts");
  });
});
