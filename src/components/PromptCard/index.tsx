import { DianaButton, DianaIcon, DianaSpacing } from "@diana-kit/react";
import "./index.scss";
import { useLayoutEffect, useRef, useState } from "react";
import { ModalPrompt } from "./PromptModal";
import usePromptStore, { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import { closeModal, openModal } from "#/utils/functions/OpenAndCloseModal";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  prompt: recommendedPrompt | Prompt;
  type: "recommended" | "favorite";
  mainAction: "edit" | "apply";
  handleEdit?: (value: recommendedPrompt | Prompt) => void;
  handleApply?: (value: string) => void;
  handleUpdatePrompts?: () => void;
  handleDelete?: (value: recommendedPrompt | Prompt) => void;
}

export const PromptCard = ({
  prompt,
  mainAction,
  type,
  handleEdit,
  handleDelete,
  handleApply
}: Props) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isButtonVisible, setIsButtonVisible] = useState<boolean>(true);
  const formattedText = prompt.prompt.split("\n");
  const textRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { setPromptToApply } = usePromptStore();

  const handleApplyPrompt = () => {
    if (location.pathname === "/Prompts") {
      navigate("/");
      setPromptToApply(prompt.prompt);
      closeModal("promptGallery");
    } else {
      handleApply && handleApply(prompt.prompt);
      closeModal("promptGallery");
    }
  };

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const { scrollHeight, clientHeight } = textRef.current;
        setIsButtonVisible(scrollHeight > clientHeight);
      }
    };

    checkOverflow();
  }, []);

  return (
    <div>
      <div
        className="CardPromptBox"
        style={{
          width: 268,
          height: type === "favorite" ? 143 : 167
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: `${type === "favorite" ? "space-between" : "start"}`
          }}
        >
          {type === "recommended" && (
            <DianaIcon filename="icSicrediIcon_16_FillPositive"></DianaIcon>
          )}
          <p
            className="Caption Focus colorSecondary"
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              maxWidth: "16rem",
              textWrap: "nowrap"
            }}
            title={prompt.titulo}
          >
            {prompt.titulo}
          </p>
          {type === "favorite" && (
            <DianaIcon filename="icHeart_16_Filled" color="#3FA110"></DianaIcon>
          )}
        </div>
        {prompt.type === "recommended" && (
          <>
            <DianaSpacing appearance="xxx-small"></DianaSpacing>
            <p className="SmallText colorSecondary">{prompt.id_dominio}</p>
          </>
        )}
        <div
          className="Caption colorSecondary PromptTextArea"
          ref={textRef}
          style={{ marginTop: 16 }}
        >
          {formattedText.map((line, index) => (
            <p key={index} style={{ whiteSpace: "pre-wrap" }}>
              {line || <br />}
            </p>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          {mainAction === "edit" ? (
            <div className="IconButtons_Prompts">
              <DianaIcon
                filename="icEdit_16_NoFill"
                onClick={() => {
                  if (prompt.type === "recommended") {
                    openModal("editRecommendedPrompt");
                  } else {
                    openModal("editFavoritePrompt");
                  }
                  handleEdit && handleEdit(prompt);
                }}
              ></DianaIcon>
              <DianaIcon
                filename="icTrash_16_NoFill"
                onClick={() => {
                  openModal("deletePrompt");
                  handleDelete && handleDelete(prompt);
                }}
              ></DianaIcon>
            </div>
          ) : (
            <div className="ButtonBox">
              {isButtonVisible && (
                <DianaButton size="small" onClick={() => setExpanded(true)}>
                  Ver mais
                </DianaButton>
              )}
              <DianaButton
                size="small"
                onClick={handleApplyPrompt}
                data-testid="apply-button"
              >
                Aplicar
              </DianaButton>
            </div>
          )}
        </div>
      </div>
      <ModalPrompt
        titulo={prompt.titulo}
        descricao={prompt.type === "recommended" ? prompt.id_dominio : undefined}
        prompt={prompt.prompt}
        mainAction={mainAction}
        type={type}
        handleReduce={setExpanded}
        isOpen={expanded}
        handleApplyPrompt={handleApply}
      ></ModalPrompt>
    </div>
  );
};
