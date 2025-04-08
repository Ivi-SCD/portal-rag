import usePromptStore, { Prompt } from "#/stores/promptsStore";
import { getFavoritesPrompts, postFavoritePrompt } from "#/utils/apis";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";
import {
  DianaButton,
  DianaInput,
  DianaModal,
  DianaSpacing,
  DianaTextarea
} from "@diana-kit/react";
import { useEffect, useRef, useState } from "react";
import { responsePrompt } from "../UserMessageBox";
import { showToastFunction } from "#/utils/functions/ShowToast";
import axios from "axios";

interface Props {
  text?: string;
}

export const ModalAddFavoritePrompt = ({ text }: Props) => {
  const { setFavoritePrompt } = usePromptStore();
  const [promptName, setPromptName] = useState<string>("");
  const [errorPromptName, setErrorPromptName] = useState<string>();
  const [promptText, setPromptText] = useState<string>();
  const [errorPromptText, setErrorPromptText] = useState<string>();
  const [disableButton, setDisableButton] = useState<boolean>(false);
  const inputRef = useRef<HTMLDianaInputElement>(null);

  useEffect(() => {
    const currentInput = inputRef.current;
    if (currentInput) {
      currentInput.addEventListener("input", handleInputChange);
    }

    return () => {
      if (currentInput) {
        currentInput.removeEventListener("input", handleInputChange);
      }
    };
  }, []);

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const regex = /[^a-zA-Z0-9\s\u00C0-\u00FF]/g;
    if (regex.test(target.value)) {
      setErrorPromptName("Caracteres especiais não são permitidos.");
    } else {
      setErrorPromptName("");
    }
    setPromptName(target.value);
  };

  useEffect(() => {
    setPromptText(text);
  }, [text]);

  const addPrompt = async () => {
    promptName === "" && setErrorPromptName("Digite o título do prompt para continuar.");
    promptText === "" && setErrorPromptText("Digite o prompt para continuar.");
    if (promptText && promptName && errorPromptName === "") {
      setDisableButton(true);
      try {
        await postFavoritePrompt(promptText!, promptName);
        closeModal("addFavoritePrompt");
        showToastFunction("success", "Prompt favoritado com sucesso!");
        getPrompts();
        setPromptText("");
        setPromptName("");
        setDisableButton(false);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          showToastFunction("error", "Já existe um prompt com esse nome!");
        } else {
          showToastFunction("error", "Não foi possível editar o prompt!");
        }
        setDisableButton(false);
      }
    }
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

  return (
    <DianaModal
      label="Deseja favoritar esse prompt?"
      id="addFavoritePrompt"
      style={{ height: "80%" }}
      onModalClosed={() => {
        setPromptName("");
        setPromptText("");
      }}
      onModalOpened={() => {
        setPromptText(text);
      }}
    >
      <DianaInput
        label="Digite o título do prompt"
        helpermessage="Digite o título do prompt"
        style={{ width: 1070 }}
        ref={inputRef}
        value={promptName}
        required
        errormessage={errorPromptName}
      ></DianaInput>
      <DianaSpacing appearance="large"></DianaSpacing>
      <DianaTextarea
        label="Digite o prompt"
        hintMessage="Digite o prompt"
        style={{ width: 1070 }}
        onChanged={(e) => {
          setPromptText(e.target.value);
          setErrorPromptText("");
        }}
        value={promptText}
        required
        errorMessage={errorPromptText}
      ></DianaTextarea>
      <DianaSpacing appearance="x-large"></DianaSpacing>
      <span style={{ display: "flex", gap: "30px", width: "100%" }}>
        <div style={{ flex: 1 }}>
          <DianaButton
            appearance="secondary"
            size="block"
            onClick={() => {
              closeModal("addFavoritePrompt");
              setPromptName("");
              setPromptText("");
            }}
            disabled={disableButton}
          >
            Cancelar
          </DianaButton>
        </div>
        <div style={{ flex: 1 }}>
          <DianaButton
            appearance="primary"
            size="block"
            onClick={addPrompt}
            disabled={disableButton}
          >
            Salvar
          </DianaButton>
        </div>
      </span>
    </DianaModal>
  );
};
