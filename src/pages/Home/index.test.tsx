import { render, screen, waitFor } from "#/utils/testUtils";
import { describe, it, vi } from "vitest";
import { Home } from ".";
import * as APIS from "#/utils/apis";
import useFilterStore from "#/stores/filtersStore";
import * as updateFuntion from "#/utils/functions/updateDomains";
import { Dominio } from "#/stores/dominiosStore";
import {
  mockedFilters,
  mockedPrivateFilters,
  mockedPublicFilters,
  mockPrivateDomains,
  mockPublicDomains
} from "../../utils/mock/mockHome";

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

function setup() {
  return render({
    routes: [
      {
        path: "/",
        index: true,
        element: <Home />
      }
    ],
    memoryRouter: {
      initialEntries: ["/"]
    }
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

describe("Pages > Home", () => {
  beforeEach(() => {
    vi.mock("@axa-fr/react-oidc", () => ({
      useOidcAccessToken: () => "fake-access-token",
      useOidc: () => ({
        logout: () => ({})
      })
    }));
  });

  it("deve renderizar a home", () => {
    setup();
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("deve renderizar o banner", () => {
    setup();
    const banner = screen.getByTestId("banner");
    expect(banner).toBeInTheDocument();

    expect(
      screen.getByText(
        `Boas-vindas ao Portal RAG, o Repositório de Aprendizado Generativo do Sicredi!`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Aproveite o potencial da IA Generativa ao extrair o máximo de informações dos seus documentos, ou utilize os domínios de conhecimento compartilhados com você.`
      )
    ).toBeInTheDocument();

    const imagem = screen.getByRole("img", {
      name: /Imagem de uma mulher sorrindo apontando para um notebook/i
    });
    expect(imagem).toBeInTheDocument();
    expect(imagem).toHaveAttribute("src", "\\img\\40-TRANSPARENCIA-01.jpg");
    expect(imagem).toHaveAttribute(
      "alt",
      "Imagem de uma mulher sorrindo apontando para um notebook"
    );
  });

  it("deve renderizar os filtros públicos e privados corretamente após a requisição", async () => {
    const dominios = [...mockPrivateDomains, ...mockPublicDomains];

    const updateDomainsSpy = vi
      .spyOn(updateFuntion, "updateDomains")
      .mockResolvedValueOnce(dominios as Dominio[]);

    useFilterStore.setState({ filters: mockedFilters });

    setup();

    await waitFor(() => {
      expect(
        screen.getByText("Selecione um domínio de base para sua conversa")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios públicos")).toBeInTheDocument();
      expect(screen.getByText("Domínios privados")).toBeInTheDocument();
      expect(screen.getByText("dominio-publico-teste")).toBeInTheDocument();
      expect(screen.getByText("dominio-privado-teste")).toBeInTheDocument();
    });
    expect(updateDomainsSpy).toHaveBeenCalled();
  });

  it("deve renderizar apenas os filtros públicos após a requisição", async () => {
    const updateDomainsSpy = vi
      .spyOn(updateFuntion, "updateDomains")
      .mockResolvedValueOnce(mockPublicDomains as Dominio[]);

    useFilterStore.setState({ filters: mockedPublicFilters });

    setup();

    await waitFor(() => {
      expect(
        screen.getByText("Selecione um domínio de base para sua conversa")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios públicos")).toBeInTheDocument();
      expect(screen.queryByText("Domínios privados")).not.toBeInTheDocument();
      expect(screen.getByText("dominio-publico-teste")).toBeInTheDocument();
    });
    expect(updateDomainsSpy).toHaveBeenCalled();
  });

  it("deve renderizar apenas os filtros públicos após um erro na requisição dos privados", async () => {
    vi.spyOn(APIS, "getDomainsPrivateAPI").mockRejectedValueOnce([]);
    vi.spyOn(APIS, "getPublicDomainsAPI").mockResolvedValueOnce(mockPublicDomains);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    useFilterStore.setState({ filters: mockedPublicFilters });

    setup();

    await waitFor(() => {
      expect(
        screen.getByText("Selecione um domínio de base para sua conversa")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios públicos")).toBeInTheDocument();
      expect(screen.queryByText("Domínios privados")).not.toBeInTheDocument();
      expect(screen.getByText("dominio-publico-teste")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching private domains:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("deve renderizar apenas os filtros privados após a requisição", async () => {
    const updateDomainsSpy = vi
      .spyOn(updateFuntion, "updateDomains")
      .mockResolvedValueOnce(mockPrivateDomains as Dominio[]);

    useFilterStore.setState({ filters: mockedPrivateFilters });

    setup();

    await waitFor(() => {
      expect(
        screen.getByText("Selecione um domínio de base para sua conversa")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios públicos")).toBeInTheDocument();
      expect(
        screen.getByText("No momento, não há domínios disponíveis")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios privados")).toBeInTheDocument();
      expect(screen.getByText("dominio-private-teste")).toBeInTheDocument();
    });

    expect(updateDomainsSpy).toHaveBeenCalled();
  });

  it("deve renderizar apenas os filtros privados após erro na requisição dos públicos", async () => {
    vi.spyOn(APIS, "getDomainsPrivateAPI").mockResolvedValueOnce(mockPrivateDomains);
    vi.spyOn(APIS, "getPublicDomainsAPI").mockRejectedValueOnce([]);

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    useFilterStore.setState({ filters: mockedPrivateFilters });

    setup();

    await waitFor(() => {
      expect(
        screen.getByText("Selecione um domínio de base para sua conversa")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios públicos")).toBeInTheDocument();
      expect(
        screen.getByText("No momento, não há domínios disponíveis")
      ).toBeInTheDocument();
      expect(screen.getByText("Domínios privados")).toBeInTheDocument();
      expect(screen.getByText("dominio-private-teste")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching public domains:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("deve renderizar o textarea", () => {
    setup();
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  it("deve renderizar o textarea", () => {
    setup();
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  it("deve renderizar o modal de prompts", () => {
    setup();
    expect(screen.getByTestId("prompt-gallery-modal")).toBeInTheDocument();
  });
});
