import { DianaIcon, DianaTag } from "@diana-kit/react";
import "./index.scss";
import { IconButton } from "../IconButton";
import { useEffect, useRef, useState } from "react";
import { DropdowMenu } from "../DropdownMenu";
import useFilterStore, { Filter } from "#/stores/filtersStore";
import { DocumenteBox } from "../DocumentBox";
import { Dominio } from "#/stores/dominiosStore";
import usePromptStore from "#/stores/promptsStore";
import { useLocation } from "react-router-dom";
import useMessageStore from "#/stores/messagesStore";
import { updateDomains } from "#/utils/functions/updateDomains";

type Props = {
  value: string;
  uploadState: (value: string) => void;
  handleSendMessage: () => void;
  onFileChange: (file: File | null) => void;
  disabled: boolean;
  showFileName: boolean;
};

export const Textarea = ({
  value,
  uploadState,
  handleSendMessage,
  onFileChange,
  disabled,
  showFileName
}: Props) => {
  const location = useLocation();
  const [tags, setTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { filters, toggleFilter, setFilters } = useFilterStore();
  const { messages } = useMessageStore();
  const { setPromptToApply } = usePromptStore();
  const [errorFile, setErrorFile] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const allowedExtensions =
    /^(text\/plain|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|application\/pdf|application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|image\/png|image\/jpeg|application\/vnd.openxmlformats-officedocument.presentationml.presentation)$/i;

  useEffect(() => {
    if (filters.length < 1) {
      const getDominios = async () => {
        try {
          const response = await updateDomains();
          const currentFilters: Filter[] = [];
          response.map((item: Dominio) => {
            currentFilters.push({
              type: item.access,
              name: item.id_dominio,
              selected: false
            });
          });
          setFilters(currentFilters);
        } catch {
          console.log("Não foi possível buscar os domínios");
        }
      };
      getDominios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSend = () => {
    if (location.pathname === "/") {
      if (value.trim() != "") {
        if (filters.filter((i) => i.selected === true).length || file) {
          handleSendMessage();
          uploadState("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setErrorMessage("Selecione um domínio ou insira um documento para continuar.");
        }
      } else {
        setErrorMessage("Digite uma dúvida para continuar.");
      }
    } else {
      if (value != "") {
        if (
          filters.filter((i) => i.selected === true).length ||
          messages.filter((i) => i.type === "user").some((i) => i.file)
        ) {
          handleSendMessage();
          uploadState("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          if (file) {
            handleSendMessage();
            uploadState("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else {
            setErrorMessage(
              "Selecione um domínio ou insira um documento para continuar."
            );
          }
        }
      } else {
        setErrorMessage("Digite uma dúvida para continuar.");
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorFile("");
    setErrorMessage(undefined);
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size > 262144000) {
        setErrorFile("O arquivo excedeu o limite de tamanho permitido");
      } else if (!allowedExtensions.exec(event.target.files[0].type)) {
        setErrorFile(
          "Por favor, selecione um arquivo com uma extensão válida: .txt, .doc, .docx, .pdf, .xls, .xlsx, .png, .jpg"
        );
      } else {
        onFileChange(event.target.files[0]);
        setFile(event.target.files[0]);
      }
    } else {
      onFileChange(null);
    }
  };

  const cleanFile = () => {
    onFileChange(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (errorMessage === "Digite uma dúvida para continuar.") {
      setErrorMessage(undefined);
    }
    setPromptToApply(undefined);
    uploadState(value);
    if (value === "/") {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const onPressEnterSend = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && value != "/") {
      event.preventDefault();
      if (value.trim() != "") {
        handleSend();
      } else {
        setErrorMessage("Digite uma dúvida para continuar.");
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && showDropdown) {
      event.preventDefault();
      const selectedFilters = filters
        .filter((item) => item.selected === true)
        .map((item) => item.name);
      setTags(selectedFilters);
      uploadState("");
      setShowDropdown(false);
      setErrorMessage(undefined);
    }
  };

  const handleRemoveTag = (name: string) => {
    setTags(tags.filter((item) => item !== name));
    filters.forEach((item: Filter) => {
      if (item.name === name) {
        toggleFilter(name);
      }
    });
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Resetar a altura para calcular corretamente
      textarea.style.height = "auto";
      // Definir a altura de acordo com o scrollHeight, limitado a 3 linhas
      const maxHeight = parseInt(getComputedStyle(textarea).lineHeight || "0") * 3;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  useEffect(() => {
    setErrorMessage(undefined);
  }, [filters]);

  return (
    <div>
      <div
        className="TextareaBox"
        onKeyDown={handleKeyDown}
        style={{ borderColor: errorMessage ? "#AA003C" : "" }}
        data-testid="textarea"
      >
        <div style={{ display: "flex", width: "100%" }}>
          {tags.map((tag, index) => (
            <DianaTag color="green" key={index}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <DianaIcon
                  filename="icClose_16_Fill"
                  color="#FFFFFF"
                  onClick={() => handleRemoveTag(tag)}
                ></DianaIcon>
              </div>
              {tag}
            </DianaTag>
          ))}
          <div style={{ position: "relative", width: "100%" }}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={handleInputChange}
              placeholder="Digite aqui a sua dúvida"
              disabled={disabled}
              onKeyDown={onPressEnterSend}
            ></textarea>
            <DropdowMenu
              options={filters}
              selectFunction={toggleFilter}
              isOpen={showDropdown}
            ></DropdowMenu>
          </div>
        </div>
        {errorFile === "" ? (
          showFileName &&
          file && <DocumenteBox fileName={file.name} cleanFile={cleanFile}></DocumenteBox>
        ) : (
          <div className="ErrorBox">
            <DianaIcon
              filename="icDocumentRemove_16_NoFill"
              description="Icone de um documento com um x no canto inferior direito"
              color="#AA003C"
            ></DianaIcon>
            <h6 className="titleH6">{errorFile}</h6>
            <DianaIcon
              filename="icError_16_NoFill"
              color="#AA003C"
              onClick={() => {
                setErrorFile("");
                cleanFile();
              }}
            ></DianaIcon>
          </div>
        )}
        <div className="Buttons">
          <>
            <IconButton
              icon={"/icons/Clips.svg"}
              description={"Icone de um clips"}
              onClick={handleFileUpload}
              disabled={disabled}
              testeId="IconButtonUpload"
            ></IconButton>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".txt, .doc, .docx, .pdf, .xls, .xlsx, .png, .jpg, .pptx"
              data-testid="input-file-textarea"
            />
          </>
          <span className="Bar"></span>
          <IconButton
            icon="/icons/Send.svg"
            description="Icone de envio"
            onClick={handleSend}
            disabled={errorFile != "" ? true : disabled}
            testeId="IconButtonSend"
          ></IconButton>
        </div>
      </div>
      {errorMessage && (
        <span
          id="input-1-message"
          className="helper-message ErrorMessageColor"
          aria-invalid="false"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};
