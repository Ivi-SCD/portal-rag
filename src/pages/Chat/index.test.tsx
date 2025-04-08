import { act, fireEvent, render, screen, waitFor } from "#/utils/testUtils";
import { describe, it, vi, MockInstance } from "vitest";
import { Chat } from "./Index";
import useMessageStore from "#/stores/messagesStore";
import * as APIS from "#/utils/apis";
import {
  botMessage,
  botMessageWithDoc,
  botResponse,
  botResponseWithDoc,
  errorBotMessage,
  message,
  messageWithDoc,
  mockedFilters,
  mockedNotSelectFilters
} from "../../utils/mock/mockChat";
import useFilterStore from "#/stores/filtersStore";

const mockNavigate = vi.fn();

let mockFecth: MockInstance;

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
  return render({
    routes: [
      {
        path: "/Chat",
        element: <Chat />
      }
    ],
    memoryRouter: {
      initialEntries: ["/Chat"]
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

const mockSessionStorage: Record<string, string> = {};
vi.stubGlobal("sessionStorage", {
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorage[key] = value;
  }),
  getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
  removeItem: vi.fn((key: string) => {
    delete mockSessionStorage[key];
  })
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

  it("deve renderizar o Chat", () => {
    useMessageStore.setState({ messages: [message] });
    window.HTMLElement.prototype.scrollIntoView = function () {};
    setup();
    expect(screen.getByTestId("chat")).toBeInTheDocument();
  });

  it("deve renderizar o botão nova conversa", () => {
    useMessageStore.setState({ messages: [message] });
    window.HTMLElement.prototype.scrollIntoView = function () {};
    setup();
    expect(screen.getByText("Nova conversa")).toBeInTheDocument();
  });

  it("deve renderizar as tags com filtros selecionados se tiver algum filtro", () => {
    useMessageStore.setState({ messages: [message] });
    useFilterStore.setState({ filters: mockedFilters });
    window.HTMLElement.prototype.scrollIntoView = function () {};
    setup();
    expect(document.getElementById("diana-tag-chat")).toBeInTheDocument();
    expect(screen.getByText("dominio-publico-teste")).toBeInTheDocument();
    expect(screen.queryByText("dominio-private-teste")).not.toBeInTheDocument();
  });

  it("não deve renderizar tags se nenhum filtro estiver selecionado", () => {
    useMessageStore.setState({ messages: [message] });
    useFilterStore.setState({ filters: mockedNotSelectFilters });
    window.HTMLElement.prototype.scrollIntoView = function () {};
    setup();
    expect(document.getElementById("diana-tag-chat")).not.toBeInTheDocument();
  });

  it("deve renderizar a mensagem sem documento do usuário e resposta do bot", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {};

    sessionStorage.setItem("ExecuteInicialFunction", "true");

    // Inicializa o estado com a mensagem do usuário
    useMessageStore.setState({ messages: [message] });

    // Mocka a função de post da API para retornar um valor específico
    mockFecth = vi.spyOn(APIS, "postResponseChat").mockResolvedValueOnce(botResponse);

    // Renderiza a página do chat
    await act(async () => {
      setup();
    });

    expect(screen.getByTestId("user-message-box")).toBeInTheDocument();
    expect(screen.getAllByText(message.text)[0]).toBeInTheDocument();

    await waitFor(() => {
      useMessageStore.setState({ messages: [messageWithDoc, botMessage] });
      expect(screen.getByText(botMessage.text)).toBeInTheDocument();
    });

    expect(mockFecth).toHaveBeenCalledOnce();
  });

  it("deve renderizar a mensagem sem documento do usuário e resposta do bot quando da erro", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {};

    // Seta o item no sessionStorage para executar assim que chegar na página
    sessionStorage.setItem("ExecuteInicialFunction", "true");

    // Inicializa o estado com a mensagem do usuário
    useMessageStore.setState({ messages: [message] });

    // Mocka a função de post da API para retornar um valor específico
    mockFecth = vi.spyOn(APIS, "postResponseChat").mockRejectedValueOnce([]);

    // Renderiza a página do chat
    await act(async () => {
      setup();
    });

    expect(screen.getByTestId("user-message-box")).toBeInTheDocument();
    expect(screen.getAllByText(message.text)[0]).toBeInTheDocument();

    await waitFor(() => {
      useMessageStore.setState({ messages: [messageWithDoc, errorBotMessage] });
      expect(screen.getByText(errorBotMessage.text)).toBeInTheDocument();
    });

    expect(mockFecth).toHaveBeenCalledOnce();
  });

  it("deve renderizar a mensagem com documento do usuário e resposta do bot com documento", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {};

    // Seta o item no sessionStorage para executar assim que chegar na página
    sessionStorage.setItem("ExecuteInicialFunction", "true");

    // Inicializa o estado com a mensagem do usuário
    useMessageStore.setState({ messages: [messageWithDoc] });

    // Mocka a função de post da API para retornar um valor específico
    mockFecth = vi
      .spyOn(APIS, "postResponseChat")
      .mockResolvedValueOnce(botResponseWithDoc);

    // Renderiza a página do chat
    await act(async () => {
      setup();
    });
    sessionStorage.setItem("ExecuteInicialFunction", "false");

    expect(screen.getByTestId("user-message-box")).toBeInTheDocument();
    expect(screen.getByText(messageWithDoc.text)).toBeInTheDocument();

    await waitFor(() => {
      useMessageStore.setState({ messages: [messageWithDoc, botMessageWithDoc] });
      expect(screen.getByText(botMessageWithDoc.text)).toBeInTheDocument();
      botMessageWithDoc.fileList?.map((item) => {
        expect(screen.getByText(item.nome_documento)).toBeInTheDocument();
      });
    });

    expect(mockFecth).toHaveBeenCalledOnce();
  });

  it("deve renderizar a mensagem do usuário com doc e resposta do bot após clicar em enviar", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {};
    sessionStorage.setItem("ExecuteInicialFunction", "false");

    useMessageStore.setState({ messages: [message, botMessage] });

    mockFecth = vi
      .spyOn(APIS, "postResponseChat")
      .mockResolvedValueOnce(botResponseWithDoc);

    // Renderiza a página do chat
    await act(async () => {
      setup();
    });

    const userMessageElement = screen.getAllByTestId("user-message-box");
    const botMessageElement = screen.getAllByTestId("bot-message-box");

    expect(userMessageElement).toHaveLength(1);
    expect(screen.getByText(message.text)).toBeInTheDocument();
    expect(botMessageElement).toHaveLength(1);
    expect(screen.getByText(botMessage.text)).toBeInTheDocument();

    const file = new File(["teste teste"], "teste.txt", {
      type: "text/plain"
    });

    // Simula a entrada do usuário
    const input = screen.getByPlaceholderText("Digite aqui a sua dúvida");
    fireEvent.change(input, { target: { value: messageWithDoc.text } });

    const uploadButton = screen.getByTestId("IconButtonUpload");
    fireEvent.click(uploadButton);

    const inputFile = screen.getByTestId("input-file-textarea") as HTMLInputElement;
    fireEvent.change(inputFile, { target: { files: [file] } });

    // Verifica se o arquivo foi setado corretamente
    expect(inputFile.files![0]).toEqual(file);
    expect(inputFile.files).toHaveLength(1);

    // Clica no botão de enviar
    const sendButton = screen.getByTestId("IconButtonSend");
    fireEvent.click(sendButton);

    // Espera pela renderização das mensagens
    await waitFor(() => {
      expect(screen.getByText(messageWithDoc.text)).toBeInTheDocument();
      expect(screen.getByText(botMessageWithDoc.text)).toBeInTheDocument();
    });

    expect(screen.getAllByTestId("user-message-box")).toHaveLength(2);
    expect(screen.getAllByTestId("bot-message-box")).toHaveLength(2);

    expect(mockFecth).toHaveBeenCalledOnce();
  });

  it("deve abrir modal ao clicar em Galeria de Prompts", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {};
    sessionStorage.setItem("ExecuteInicialFunction", "false");
    useMessageStore.setState({ messages: [message, botMessage] });

    setup();

    expect(screen.getByTestId("prompt-gallery-modal")).not.toBeVisible();

    const promptsGalleryButton = screen.getByTestId("prompt-gallery-button");
    fireEvent.click(promptsGalleryButton);

    await waitFor(() => {
      expect(screen.getByTestId("prompt-gallery-modal")).toBeVisible();
    });
  });

  it("deve abrir modal ao clicar em Galeria de Prompts", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {};
    sessionStorage.setItem("ExecuteInicialFunction", "false");
    useMessageStore.setState({ messages: [message, botMessage] });

    setup();

    expect(screen.getByTestId("prompt-gallery-modal")).not.toBeVisible();

    const promptsGalleryButton = screen.getByTestId("prompt-gallery-button");
    fireEvent.click(promptsGalleryButton);

    await waitFor(() => {
      expect(screen.getByTestId("prompt-gallery-modal")).toBeVisible();
    });
  });
});
