import {
  DianaButton,
  DianaInput,
  DianaModal,
  DianaSpacing,
  DianaTextarea
} from "@diana-kit/react";
import { useEffect, useRef, useState } from "react";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";
import { showToastFunction } from "#/utils/functions/ShowToast";
import { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import { editFavoritePrompt } from "#/utils/apis";
import axios from "axios";

interface Props {
  handleUpdatePrompts: () => void;
  currentPrompt?: recommendedPrompt | Prompt;
}

export const ModalEditFavoritePrompt = ({
  handleUpdatePrompts,
  currentPrompt
}: Props) => {
  const [promptTitle, setPromptTitle] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [errorPromptTitle, setErrorPromptTitle] = useState<string>("");
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
      setErrorPromptTitle("Caracteres especiais não são permitidos.");
    } else {
      setErrorPromptTitle("");
    }
    setPromptTitle(target.value);
  };

  useEffect(() => {
    if (currentPrompt) {
      setPromptTitle(currentPrompt.titulo!);
      setPromptText(currentPrompt.prompt);
    }
  }, [currentPrompt]);

  const editPrompt = async () => {
    promptTitle === "" &&
      setErrorPromptTitle("Digite o título do prompt para continuar.");
    if (currentPrompt && promptTitle && errorPromptTitle === "") {
      try {
        await editFavoritePrompt(currentPrompt.titulo, promptTitle, promptText);
        showToastFunction("success", "Prompt editado com sucesso!");
        handleUpdatePrompts();
        closeModal("editFavoritePrompt");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          showToastFunction("error", "Já existe um prompt com esse nome!");
        } else {
          showToastFunction("error", "Não foi possível editar o prompt!");
        }
      }
    }
  };

  return (
    <DianaModal label="Editar prompt" id="editFavoritePrompt" style={{ height: "80%" }}>
      <DianaInput
        label="Digite o título do prompt"
        helpermessage="Digite o título do prompt para base"
        style={{ width: 1070 }}
        value={promptTitle}
        ref={inputRef}
        errormessage={errorPromptTitle}
      ></DianaInput>
      <DianaSpacing appearance="large"></DianaSpacing>
      <DianaTextarea
        label="Digite o prompt"
        hintMessage="Digite o prompt para sua base"
        style={{ width: 1070 }}
        onChanged={(e) => setPromptText(e.target.value)}
        value={promptText}
      ></DianaTextarea>
      <DianaSpacing appearance="x-large"></DianaSpacing>
      <span style={{ display: "flex", gap: "30px", width: "100%" }}>
        <div style={{ flex: 1 }}>
          <DianaButton
            appearance="secondary"
            size="block"
            onClick={() => closeModal("editFavoritePrompt")}
          >
            Cancelar
          </DianaButton>
        </div>
        <div style={{ flex: 1 }}>
          <DianaButton appearance="primary" size="block" onClick={editPrompt}>
            Salvar
          </DianaButton>
        </div>
      </span>
    </DianaModal>
  );
};
