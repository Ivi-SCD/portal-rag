// import { openModal } from "#/utils/functions/OpenAndCloseModal";
import { DianaButton, DianaSpacing, DianaTitle } from "@diana-kit/react";
import "./TabPrompts.scss";
import { PromptCard } from "#/components/PromptCard";
import { ModalAddRecomendedPrompt } from "#/components/ModalAddRecommendedPrompt";
import { openModal } from "#/utils/functions/OpenAndCloseModal";
import { useEffect, useState } from "react";
import usePromptStore, { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import { getRecomendedPrompts } from "#/utils/apis";
import { ModalEditRecomendedPrompt } from "#/components/ModalEditRecommendedPrompt";
import { ModalDeletePrompt } from "#/components/ModalDeletePrompt/ModalDeletePrompt";

interface TabPromptsType {
  currentDomain: string;
}

export const TabPrompts = ({ currentDomain }: TabPromptsType) => {
  const { recommendedPrompts, setRecommendedPrompt } = usePromptStore();
  const [updatedCurrentDomain, setUpdatedCurrentDomain] = useState<string>();
  const [promptToEdit, setPromptToEdit] = useState<recommendedPrompt | Prompt>();
  const [promptToDelete, setPromptToDelete] = useState<recommendedPrompt | Prompt>();

  const updatePromptToEdit = (value: recommendedPrompt | Prompt) => {
    setPromptToEdit(value);
  };

  const updatePromptToDelete = (value: recommendedPrompt | Prompt) => {
    setPromptToDelete(value);
  };

  const getPrompts = async () => {
    try {
      const response = await getRecomendedPrompts(currentDomain);
      const recommendedPromptsList: recommendedPrompt[] = [];
      response.map((item: recommendedPrompt) => {
        return recommendedPromptsList.push({
          created_at: item.created_at,
          created_by: item.created_by,
          descricao: item.descricao,
          id_dominio: item.id_dominio,
          prompt: item.prompt,
          titulo: item.titulo,
          updated_at: item.updated_at,
          type: "recommended"
        });
      });
      setRecommendedPrompt(recommendedPromptsList);
    } catch (error) {
      console.log("error", "Não foi possível buscar os prompts recomendados");
    }
  };

  useEffect(() => {
    getPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <DianaSpacing appearance="large"></DianaSpacing>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="TabTitles_DominioEspecifico">
          <DianaTitle as="h3" weight="focus">
            Prompts
          </DianaTitle>
        </div>
        <DianaSpacing appearance="xx-small"></DianaSpacing>
        <DianaButton
          appearance="primary"
          disabled={false}
          size="small"
          onClick={() => {
            openModal("addRecomendedPrompt");
            setUpdatedCurrentDomain(currentDomain);
          }}
        >
          Adicionar prompt
        </DianaButton>
      </div>
      <DianaSpacing appearance="medium"></DianaSpacing>
      <div className="PromptsCardsContainer">
        {recommendedPrompts.length ? (
          recommendedPrompts.map((prompt, index) => {
            return (
              <PromptCard
                prompt={prompt}
                type="recommended"
                mainAction="edit"
                key={index}
                handleUpdatePrompts={getPrompts}
                handleEdit={updatePromptToEdit}
                handleDelete={updatePromptToDelete}
              ></PromptCard>
            );
          })
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 0px"
            }}
            className="EmpityText"
          >
            Não há prompts adicionados.
          </div>
        )}
      </div>
      <ModalAddRecomendedPrompt
        currentDomain={updatedCurrentDomain}
        handleUpdatePrompts={getPrompts}
      ></ModalAddRecomendedPrompt>
      <ModalEditRecomendedPrompt
        handleUpdatePrompts={getPrompts}
        currentPrompt={promptToEdit}
      ></ModalEditRecomendedPrompt>
      <ModalDeletePrompt
        currentPrompt={promptToDelete}
        handleUpdatePrompts={getPrompts}
      ></ModalDeletePrompt>
    </div>
  );
};
