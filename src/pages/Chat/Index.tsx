import "./index.scss";
import { Textarea } from "#/components/Textarea";
import useFilterStore from "#/stores/filtersStore";
import {
  DianaButton,
  DianaIcon,
  DianaModal,
  DianaParagraph,
  DianaSpacing,
  DianaTag,
  DianaTitle
} from "@diana-kit/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BotMessage } from "#/components/BotMessageBox";
import useMessageStore from "#/stores/messagesStore";
import { UserMessage } from "#/components/UserMessageBox";
import { ProgressBar } from "#/components/ProgressBar";
import { closeSession, postResponseChat } from "#/utils/apis";
import { v4 as uuidv4 } from "uuid";
import { ModalAddFavoritePrompt } from "#/components/ModalAddFavoritePrompt/ModalAddFavoritePrompt";
import { closeModal, openModal } from "#/utils/functions/OpenAndCloseModal";
import { ModalPromptsGallery } from "#/components/ModalPromptsGallery/ModalPromptsGallery";

export type FeedbackType = {
  message: string;
  feedback: "Like" | "Unlike" | null;
};

export const Chat = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);
  const { filters } = useFilterStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [showFileName, setShowFileName] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, cleanMessages } = useMessageStore();
  const sessionId = sessionStorage.getItem("sessionId");
  const numUserMessages = messages.filter((msg) => msg.type === "user").length;
  const selectedFilters = filters
    .filter((i) => i.selected === true)
    .map((i) => {
      return i.name;
    });
  const [messageToFavorite, setMessageToFavorite] = useState<string>();

  const updateUserInput = (value: string) => {
    setUserInput(value);
  };

  const renewSessionId = () => {
    const newSessionId = uuidv4();
    sessionStorage.setItem("sessionId", newSessionId);
  };

  // Requisição do chat
  const getResponse = async (uuidMessage: string, text: string, file?: File | null) => {
    try {
      const response = await postResponseChat(
        uuidMessage,
        text,
        selectedFilters,
        sessionId!,
        file
      );
      setLoading(false);
      addMessage(uuidMessage, response.response, "bot", undefined, response.documentos);
      setFileUploaded(null);
    } catch (error) {
      setLoading(false);
      addMessage(
        uuidMessage,
        "Desculpe, não consegui responder sua pergunta. Por favor, tente novamente mais tarde!",
        "bot",
        undefined
      );
    }
  };

  const handleHomeToChat = () => {
    if (messages.length) {
      // setUserInput(messages[0].text);
      setLoading(true);
      getResponse(messages[0].uuid, messages[0].text, messages[0].file);
    } else {
      navigate("/");
    }
  };

  // Virificação para executar a request do chat ao passar da home para o chat
  if (sessionStorage.getItem("ExecuteInicialFunction") === "true") {
    handleHomeToChat();
    sessionStorage.setItem("ExecuteInicialFunction", "false");
  }

  //Faz requisição pra encerrar session no back e limpar contexto
  const deleteSession = async () => {
    try {
      await closeSession(sessionId!);
      renewSessionId();
      console.log("Sessão finalizada");
    } catch (error) {
      setLoading(false);
      console.error("Erro na requisição:", error);
    }
  };

  // Limpa as variáveis ao voltar pra home
  const backToHome = async () => {
    await deleteSession();
    navigate("/");
    cleanMessages();
  };

  // Adicona mensagem na variável e faz requisição
  const handleSend = async () => {
    const uuidMessage = uuidv4();
    addMessage(uuidMessage, userInput.trim(), "user", fileUploaded && fileUploaded);
    setLoading(true);
    setShowFileName(false);
    if (numUserMessages === 30 && messages[messages.length - 1].type === "bot") {
      openModal("messageLimit");
    } else {
      await getResponse(uuidMessage, userInput, fileUploaded);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file != null) {
      setFileUploaded(file);
      setShowFileName(true);
    } else {
      setFileUploaded(null);
      setShowFileName(false);
    }
  };

  // Scroll para o final da página
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Controle do loading e do scroll
  useEffect(() => {
    if (
      (messages.length && messages.at(-1)!.type === "bot") ||
      !messages.length ||
      numUserMessages === 30
    ) {
      setLoading(false);
    }
    scrollToBottom();
  }, [messages, numUserMessages]);

  // Tratativa para limpar o chat ao recarregar a página ou clicar no botão de voltar do navegador
  useEffect(() => {
    if (!messages.length) {
      navigate("/");
    }

    if (localStorage.getItem("reloaded") === "true") {
      console.log("recarregado");
      navigate("/");
      localStorage.setItem("reloaded", "false");
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      deleteSession();
      localStorage.setItem("reloaded", "true");
      console.log("Página está sendo recarregada ou fechada");
      event.preventDefault();
      event.returnValue = "";
    };

    const handlePopState = () => {
      deleteSession();
      cleanMessages();
      console.log("Navegação pelo histórico detectada");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const continueConversation = () => {
    const lastQuestion = messages.filter((msg) => msg.type === "user").at(-1);
    cleanMessages();
    deleteSession();
    addMessage(lastQuestion!.uuid, lastQuestion!.text, "user", lastQuestion?.file);
    getResponse(lastQuestion!.uuid, lastQuestion!.text, lastQuestion?.file);
    closeModal("messageLimit");
  };

  return (
    <div className="Container" data-testid="chat">
      <DianaSpacing appearance="large"></DianaSpacing>
      {/*Botão de nova conversa*/}
      <div className="NewChat">
        <div className="NewChatButton" onClick={backToHome}>
          <DianaIcon
            filename="icChat_16_NoFill"
            description="Icone de balão de conversa"
            color="#33820D"
          ></DianaIcon>
          <p className="ButtonText">Nova conversa</p>
        </div>
      </div>
      {selectedFilters.length > 0 && <DianaSpacing appearance="large"></DianaSpacing>}
      {/* Título com filtros aplicados*/}
      {selectedFilters.length > 0 && (
        <div style={{ display: "flex" }}>
          {selectedFilters.map((item, index) => {
            return (
              <DianaTag
                color="green"
                icon-name="icFilter_16_NoFill"
                icon-description="Ícone de funil"
                key={index}
                id="diana-tag-chat"
              >
                {item}{" "}
              </DianaTag>
            );
          })}
        </div>
      )}
      <DianaSpacing appearance="large"></DianaSpacing>
      {/*Chat*/}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {messages ? (
          messages.map((item, index) =>
            item.type === "user" ? (
              <UserMessage
                text={item.text}
                key={index}
                fileName={item.file?.name}
                setMessageToFavorite={setMessageToFavorite}
              ></UserMessage>
            ) : (
              <BotMessage
                text={item.text}
                key={index}
                documents={item.fileList}
                uuid={item.uuid}
              ></BotMessage>
            )
          )
        ) : (
          <div>
            <DianaTitle as="h4">Digite sua dúvida abaixo</DianaTitle>
          </div>
        )}
        {loading && (
          <div className="typing-indicator" data-testid="chat-loading">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </div>

      <DianaSpacing appearance="large"></DianaSpacing>
      <div className="Prompt">
        <DianaButton
          appearance="default"
          onClick={() => openModal("promptGallery")}
          data-testid="prompt-gallery-button"
        >
          <img src="\icons\Writing.svg"></img>
          Galeria de prompts
        </DianaButton>
      </div>
      {/*Textarea*/}
      <Textarea
        value={userInput}
        uploadState={updateUserInput}
        handleSendMessage={handleSend}
        onFileChange={handleFileChange}
        disabled={numUserMessages > 30 ? true : loading}
        showFileName={showFileName}
      ></Textarea>

      <DianaSpacing appearance="medium"></DianaSpacing>
      <ProgressBar
        progress={(numUserMessages / 30) * 100}
        numMessages={numUserMessages}
      ></ProgressBar>

      <div ref={messagesEndRef} />
      <DianaModal label="Reinicie a conversa" size="large" id="messageLimit">
        <DianaParagraph>
          Você atigiu a marca de 30 conversas no chat, por favor inicie uma conversa nova
          ou reinicie a conversa com base na sua última pergunta.
        </DianaParagraph>
        <DianaSpacing appearance="large"></DianaSpacing>
        <span style={{ display: "flex", gap: "30px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <DianaButton appearance="secondary" size="block" onClick={() => backToHome()}>
              Conversa nova
            </DianaButton>
          </div>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="primary"
              size="block"
              onClick={() => continueConversation()}
            >
              Conversa utilizando a última pergunta
            </DianaButton>
          </div>
        </span>
      </DianaModal>

      <ModalAddFavoritePrompt text={messageToFavorite}></ModalAddFavoritePrompt>
      <ModalPromptsGallery handleApply={updateUserInput}></ModalPromptsGallery>
    </div>
  );
};
