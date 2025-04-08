import { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import { deleteRecomendedPromptAPI, removeFavoritePrompt } from "#/utils/apis";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";
import { showToastFunction } from "#/utils/functions/ShowToast";
import { DianaButton, DianaModal, DianaParagraph, DianaSpacing } from "@diana-kit/react";
interface Props {
  currentPrompt?: recommendedPrompt | Prompt;
  handleUpdatePrompts: () => void;
}

export const ModalDeletePrompt = ({ currentPrompt, handleUpdatePrompts }: Props) => {
  const deletePrompt = async () => {
    if (currentPrompt && currentPrompt.type === "recommended") {
      try {
        await deleteRecomendedPromptAPI(currentPrompt.id_dominio, currentPrompt.titulo);
        showToastFunction("success", "Prompt excluído com sucesso!");
        handleUpdatePrompts();
        closeModal("deletePrompt");
      } catch (error) {
        showToastFunction("error", "Não foi possível excluir o prompt");
      }
    } else if (currentPrompt && currentPrompt.type === "favorite") {
      try {
        await removeFavoritePrompt(currentPrompt.titulo);
        showToastFunction("success", "Prompt excluído com sucesso!");
        handleUpdatePrompts();
        closeModal("deletePrompt");
      } catch (error) {
        showToastFunction("error", "Não foi possível excluir o prompt");
      }
    }
  };

  return (
    <DianaModal label="Excluir" size="large" id="deletePrompt">
      <DianaParagraph>
        Deseja excluir o prompt <b>"{currentPrompt?.titulo}"</b> do sistema?
      </DianaParagraph>
      <DianaSpacing appearance="large"></DianaSpacing>
      <span style={{ display: "flex", gap: "30px", width: "100%" }}>
        <div style={{ flex: 1 }}>
          <DianaButton
            appearance="secondary"
            size="block"
            onClick={() => closeModal("deletePrompt")}
          >
            Não
          </DianaButton>
        </div>
        <div style={{ flex: 1 }}>
          <DianaButton appearance="danger" size="block" onClick={deletePrompt}>
            Sim
          </DianaButton>
        </div>
      </span>
    </DianaModal>
  );
};
