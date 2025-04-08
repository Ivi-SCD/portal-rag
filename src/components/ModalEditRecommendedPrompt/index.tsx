import {
  DianaButton,
  DianaInput,
  DianaModal,
  DianaSelectSingle,
  DianaSpacing,
  DianaTextarea
} from "@diana-kit/react";
import { useEffect, useRef, useState } from "react";
import { editRecomendedPrompts, getDomainsAPI } from "#/utils/apis";
import { Dominio } from "#/stores/dominiosStore";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";
import { showToastFunction } from "#/utils/functions/ShowToast";
import { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import axios from "axios";

interface Props {
  handleUpdatePrompts: () => void;
  currentPrompt?: recommendedPrompt | Prompt;
}

interface Option {
  label: string;
  value: string;
}

export const ModalEditRecomendedPrompt = ({
  handleUpdatePrompts,
  currentPrompt
}: Props) => {
  const [dominiosToSelect, setDominiosToSelect] = useState<Option[]>([]);
  const [promptTitle, setPromptTitle] = useState<string>("");
  const [errorPromptTitle, setErrorPromptTitle] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
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

  const getDominios = async () => {
    try {
      const response = await getDomainsAPI();
      const currentFilters: Option[] = [];
      response.map((item: Dominio) => {
        currentFilters.push({
          label: item.id_dominio,
          value: item.id_dominio
        });
      });
      setDominiosToSelect(currentFilters);
    } catch {
      console.log("Não foi possível buscar os domínios");
    }
  };

  useEffect(() => {
    getDominios();
  }, []);

  useEffect(() => {
    if (currentPrompt && currentPrompt.type === "recommended") {
      setDomain(currentPrompt.id_dominio!);
      setPromptTitle(currentPrompt.titulo!);
      setPromptText(currentPrompt.prompt);
    }
  }, [currentPrompt]);

  const editPrompt = async () => {
    promptTitle === "" &&
      setErrorPromptTitle("Digite o título do prompt para continuar.");
    if (
      currentPrompt &&
      currentPrompt.type === "recommended" &&
      promptTitle &&
      errorPromptTitle === ""
    ) {
      try {
        await editRecomendedPrompts(
          currentPrompt.id_dominio,
          domain,
          currentPrompt.titulo,
          promptTitle,
          promptText
        );
        showToastFunction("success", "Prompt editado com sucesso!");
        closeModal("editRecommendedPrompt");
        handleUpdatePrompts();
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.data.message === "Prompt já existe neste domínio!"
        ) {
          showToastFunction(
            "error",
            "Já existe um prompt com este título neste domínio!"
          );
        } else {
          showToastFunction("error", "Não foi possível editar o prompt!");
        }
      }
    }
  };

  return (
    <DianaModal
      label="Editar prompt"
      id="editRecommendedPrompt"
      style={{ height: "80%" }}
    >
      <DianaInput
        label="Digite o título do prompt"
        helpermessage="Digite o título do prompt para base"
        style={{ width: 1070 }}
        value={promptTitle}
        ref={inputRef}
        errormessage={errorPromptTitle}
      ></DianaInput>
      <DianaSpacing appearance="large"></DianaSpacing>
      <DianaSelectSingle
        name="selected-item"
        label="Para qual domínio o prompt vai?"
        helpertext="Digite o domínio"
        optionslist={dominiosToSelect}
        selecteditem={{
          label: domain,
          value: domain
        }}
        onDianaSelectValue={(e) => setDomain(e.target.value)}
        required
      ></DianaSelectSingle>
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
            onClick={() => closeModal("editRecommendedPrompt")}
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
