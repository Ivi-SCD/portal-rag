import { DianaIcon, DianaTitle } from "@diana-kit/react";
import "./index.scss";
import { DocumenteBox } from "../DocumentBox";
import usePromptStore, { Prompt } from "#/stores/promptsStore";
import { useEffect, useState } from "react";
import { getFavoritesPrompts, removeFavoritePrompt } from "#/utils/apis";
import { openModal } from "#/utils/functions/OpenAndCloseModal";

interface userMessageType {
  text: string;
  fileName?: string;
  setMessageToFavorite: (value: string) => void;
}

export type responsePrompt = {
  created_at: string;
  ldap: string;
  prompt: string;
  titulo: string;
};

export const UserMessage = ({
  text,
  fileName,
  setMessageToFavorite
}: userMessageType) => {
  const { favoritePrompts, setFavoritePrompt } = usePromptStore();
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const formattedText = text.split("\n");

  const sendFavorite = async () => {
    setMessageToFavorite(text);
    openModal("addFavoritePrompt");
    getPrompts();
  };

  const getPrompts = async () => {
    try {
      const response = await getFavoritesPrompts();
      const currentFavoritePrompts: Prompt[] = [];
      response.map((item: responsePrompt) => {
        currentFavoritePrompts.push({
          prompt: item.prompt,
          titulo: item.titulo,
          type: "favorite"
        });
      });
      setFavoritePrompt(currentFavoritePrompts);
    } catch (error) {
      console.error("Erro ao buscar prompts favoritos:", error);
    }
  };

  useEffect(() => {
    getPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFavorite = async (titulo: string) => {
    try {
      await removeFavoritePrompt(titulo);
      console.log("desfavoritado");
    } catch (error) {
      console.error("Erro ao desfavoritar prompt:", error);
    }
    getPrompts();
  };

  const copyText = () => {
    // const textToCopy = formattedText.map((line) => line || "\n").join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Texto copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar texto: ", err);
      });
  };

  return (
    <div className="UserMessageBox" data-testid="user-message-box">
      {showToolbar && (
        <div
          className="Toolbar"
          onMouseEnter={() => setShowToolbar(true)}
          onMouseLeave={() => setShowToolbar(false)}
          data-testid="toolbar-user-message"
        >
          <DianaIcon
            filename="icCopy_16_NoFill"
            description="Icone de duas folhas sobrepostas representando copiar mensagem"
            onClick={copyText}
          ></DianaIcon>
          {favoritePrompts.find((item) => item.prompt === text) ? (
            <DianaIcon
              filename="icHeart_16_Filled"
              color="#3FA110"
              onClick={() =>
                removeFavorite(
                  favoritePrompts.find((item) => item.prompt === text)!.titulo
                )
              }
            ></DianaIcon>
          ) : (
            <DianaIcon
              filename="icHeart_16_NoFill"
              color="#3FA110"
              onClick={sendFavorite}
            ></DianaIcon>
          )}
        </div>
      )}
      <div className="TextArea">
        <div
          className="TextBox"
          onMouseEnter={() => setShowToolbar(true)}
          onMouseLeave={() => setShowToolbar(false)}
          data-testid="user-message-text"
        >
          <DianaTitle as="h5">
            {formattedText.map((line, index) => (
              <p key={index} style={{ whiteSpace: "pre-wrap" }}>
                {line || <br />}
              </p>
            ))}
          </DianaTitle>
          {fileName && <DocumenteBox fileName={fileName}></DocumenteBox>}
        </div>
        <DianaIcon filename={"icInformalUser_24_NoFill"} color="#3FA110"></DianaIcon>
      </div>
    </div>
  );
};
