import { DianaButton, DianaIcon, DianaSpacing } from "@diana-kit/react";
import "./index.scss";
import { useLocation, useNavigate } from "react-router-dom";
import usePromptStore from "#/stores/promptsStore";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";

interface PropsModal {
  titulo: string;
  prompt: string;
  descricao?: string;
  type: "recommended" | "favorite";
  mainAction: "edit" | "apply";
  handleEdit?: () => void;
  handleApplyPrompt?: (value: string) => void;
  handleReduce: (value: React.SetStateAction<boolean>) => void;
  isOpen: boolean;
}

export const ModalPrompt = ({
  titulo,
  descricao,
  prompt,
  mainAction,
  type,
  handleReduce,
  isOpen,
  handleApplyPrompt
}: PropsModal) => {
  const formattedText = prompt.split("\n");
  const location = useLocation();
  const navigate = useNavigate();
  const { setPromptToApply } = usePromptStore();

  const handleApply = () => {
    if (location.pathname === "/Prompts") {
      navigate("/");
      setPromptToApply(prompt);
      closeModal("promptGallery");
      handleReduce(!isOpen);
    } else {
      handleApplyPrompt && handleApplyPrompt(prompt);
      closeModal("promptGallery");
      handleReduce(!isOpen);
    }
  };

  return (
    <div className={`ModalPromptContainer ${isOpen && "ShowPromptModal"}`}>
      <div className={`CardPromptBox ModalPromptBox ${isOpen && "ShowPromptModal"}`}>
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
          <p className="Caption Focus colorSecondary">{titulo}</p>
          {type === "favorite" && (
            <DianaIcon filename="icHeart_16_Filled" color="#3FA110"></DianaIcon>
          )}
        </div>
        {type === "recommended" && (
          <>
            <DianaSpacing appearance="xxx-small"></DianaSpacing>
            <p className="SmallText colorSecondary">{descricao}</p>
          </>
        )}
        <div
          className="Caption colorSecondary PromptTextAreaModal"
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
              <DianaIcon filename="icEdit_16_NoFill"></DianaIcon>
              <DianaIcon filename="icTrash_16_NoFill"></DianaIcon>
            </div>
          ) : (
            <div className="ButtonBox">
              <DianaButton size="small" onClick={() => handleReduce(false)}>
                Fechar
              </DianaButton>
              <DianaButton size="small" onClick={handleApply}>
                Aplicar
              </DianaButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
