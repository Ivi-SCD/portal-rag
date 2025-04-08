import {
  DianaButton,
  DianaInput,
  DianaModal,
  DianaSelectSingle,
  DianaSpacing,
  DianaTextarea
} from "@diana-kit/react";
import { useEffect, useRef, useState } from "react";
import { getDomainsAPI, postRecomendedPrompts } from "#/utils/apis";
import { Dominio } from "#/stores/dominiosStore";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";
import { showToastFunction } from "#/utils/functions/ShowToast";
import axios from "axios";

interface Props {
  handleUpdatePrompts: () => void;
  currentDomain?: string;
}

interface Option {
  label: string;
  value: string;
}

export const ModalAddRecomendedPrompt = ({
  currentDomain,
  handleUpdatePrompts
}: Props) => {
  const [dominiosToSelect, setDominiosToSelect] = useState<Option[]>([]);
  const [promptName, setPromptName] = useState<string>("");
  const [errorPromptName, setErrorPromptName] = useState<string>();
  const [domain, setDomain] = useState<string>("");
  const [errorPromptDomain, setErrorPromptDomain] = useState<string>();
  const [promptText, setPromptText] = useState<string>("");
  const [errorPromptText, setErrorPromptText] = useState<string>();
  const [disableButton, setDisableButton] = useState<boolean>(false);
  const inputRef = useRef<HTMLDianaInputElement>(null);

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

  const addPrompt = async () => {
    promptName === "" && setErrorPromptName("Digite o título do prompt para continuar.");
    domain === "" && setErrorPromptDomain("Selecione um domínio para continuar.");
    promptText === "" && setErrorPromptText("Digite o prompt para continuar.");
    if (promptName && domain && promptText && errorPromptName === "") {
      setDisableButton(true);
      try {
        await postRecomendedPrompts(domain, promptName, promptText);
        showToastFunction("success", "Prompt criado com sucesso!");
        closeModal("addRecomendedPrompt");
        handleUpdatePrompts();
        setPromptName("");
        setPromptText("");
        setDisableButton(false);
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
    getDominios();
  }, []);

  useEffect(() => {
    if (currentDomain) {
      setDomain(currentDomain);
    }
  }, [currentDomain]);

  return (
    <DianaModal
      label="Criar prompt"
      id="addRecomendedPrompt"
      style={{ height: "80%" }}
      onModalClosed={() => {
        setPromptName("");
        setPromptText("");
      }}
      onModalOpened={() => {
        currentDomain && setDomain(currentDomain);
      }}
    >
      <DianaInput
        label="Digite o título do prompt"
        helpermessage="Digite o título do prompt"
        style={{ width: 1070 }}
        value={promptName}
        errormessage={errorPromptName}
        ref={inputRef}
      ></DianaInput>
      <DianaSpacing appearance="large"></DianaSpacing>
      <DianaSelectSingle
        name="selected-item"
        label="Em qual domínio o prompt será usado?"
        helpertext="Digite o domínio"
        optionslist={dominiosToSelect}
        // value={domain}
        selecteditem={{
          label: domain,
          value: domain
        }}
        onDianaSelectValue={(e) => {
          setDomain(e.target.value);
          setErrorPromptDomain("");
        }}
        required
        errorMessage={errorPromptDomain}
      ></DianaSelectSingle>
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
              closeModal("addRecomendedPrompt");
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
