import "./ModalPromptsGallery.scss";
import { Filter } from "#/stores/filtersStore";
import usePromptStore, { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import {
  DianaInput,
  DianaModal,
  DianaSpacing,
  DianaTab,
  DianaTabs
} from "@diana-kit/react";
import { useEffect, useState } from "react";
import { PromptCard } from "../PromptCard";
import { InputFilter } from "../Multiselect";
import { getAllRecommendedPrompts, getFavoritesPrompts } from "#/utils/apis";
import { Dominio } from "#/stores/dominiosStore";
import { updateDomains } from "#/utils/functions/updateDomains";

interface Props {
  handleApply: (value: string) => void;
}

export const ModalPromptsGallery = ({ handleApply }: Props) => {
  const { recommendedPrompts, setRecommendedPrompt, favoritePrompts, setFavoritePrompt } =
    usePromptStore();
  const [activeTab, setActiveTab] = useState<"recommended" | "favorite">("favorite");
  const [domainOptions, setDomainOptions] = useState<Filter[]>([]);
  const [searchPrompt, setSearchPrompt] = useState<string>("");
  const filteredFavoritePrompts = favoritePrompts.filter((item) =>
    item.titulo.toLowerCase().includes(searchPrompt.toLowerCase())
  );

  const selectedDomains = domainOptions
    .filter((item) => item.selected === true)
    .map((domain) => domain.name);

  const filteredPromptsByDomain =
    selectedDomains.length > 0
      ? recommendedPrompts.filter((prompt) => selectedDomains.includes(prompt.id_dominio))
      : recommendedPrompts;

  const getPrompts = async () => {
    try {
      const response = await getAllRecommendedPrompts();
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
      console.log("error", "Não foi possível buscar os prompts sugeridos");
    }
  };

  const getFavorites = async () => {
    try {
      const response = await getFavoritesPrompts();
      const favoritePromptsList: Prompt[] = [];
      response.map((item: Prompt) => {
        return favoritePromptsList.push({
          prompt: item.prompt,
          titulo: item.titulo,
          type: "favorite"
        });
      });
      setFavoritePrompt(favoritePromptsList);
    } catch (error) {
      console.log("error", "Não foi possível buscar os prompts favoritos");
    }
  };

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
      setDomainOptions(currentFilters);
    } catch {
      console.log("Não foi possível buscar os domínios");
    }
  };

  useEffect(() => {
    getPrompts();
    getDominios();
    getFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DianaModal
      label="Galeria de Prompts"
      id="promptGallery"
      className="PromptsGalery"
      data-testid="prompt-gallery-modal"
    >
      <DianaTabs>
        <DianaSpacing appearance="large"></DianaSpacing>
        <DianaTab
          header="Prompts favoritos"
          open={activeTab === "favorite" && true}
          onClick={() => setActiveTab("favorite")}
        >
          <DianaInput
            label="Buscar"
            onChanged={(e) => setSearchPrompt(e.target.value)}
            style={{ width: 630 }}
            name="nome"
            type="text"
            class="search-prompt"
            aria-placeholder="Placeholder"
            helpermessage="Busque o prompt desejado"
            icon-filename="icSearch_24_NoFill"
            icon-description="Ícone de lupa"
          ></DianaInput>
          <DianaSpacing appearance="large"></DianaSpacing>
          <div className="PromptsGaleryConatiner">
            {favoritePrompts.length ? (
              filteredFavoritePrompts.length ? (
                filteredFavoritePrompts.map((prompt, index) => {
                  return (
                    <PromptCard
                      prompt={prompt}
                      type="favorite"
                      mainAction="apply"
                      key={index}
                      handleApply={handleApply}
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
                  Nenhum prompt encontrado com esse filtro
                </div>
              )
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
                Não há prompts favoritos.
              </div>
            )}
          </div>
        </DianaTab>
        <DianaTab header="Prompts sugeridos" onClick={() => setActiveTab("recommended")}>
          <div style={{ width: "60%" }}>
            <InputFilter
              label="Filtre pelo domínio"
              helpText=""
              setSelect={setDomainOptions}
              optionsList={domainOptions}
              width="100%"
            ></InputFilter>
          </div>
          <DianaSpacing appearance="large"></DianaSpacing>
          <div className="PromptsGaleryConatiner">
            {recommendedPrompts.length ? (
              filteredPromptsByDomain.length ? (
                filteredPromptsByDomain.map((prompt, index) => {
                  return (
                    <PromptCard
                      prompt={prompt}
                      type="recommended"
                      mainAction="apply"
                      key={index}
                      handleApply={handleApply}
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
                  Nenhum prompt encontrado com esse filtro
                </div>
              )
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
                Não há prompts sugeridos.
              </div>
            )}
          </div>
        </DianaTab>
      </DianaTabs>
    </DianaModal>
  );
};
