import {
  DianaBreadcrumb,
  DianaBreadcrumbItem,
  DianaButton,
  // DianaCheckboxSingle,
  DianaInput,
  DianaSpacing,
  DianaTab,
  DianaTabs,
  DianaTitle
} from "@diana-kit/react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { openModal } from "#/utils/functions/OpenAndCloseModal";
import { getAllRecommendedPrompts, getFavoritesPrompts } from "#/utils/apis";
import usePromptStore, { Prompt, recommendedPrompt } from "#/stores/promptsStore";
import { PromptCard } from "#/components/PromptCard";
import { ModalAddRecomendedPrompt } from "#/components/ModalAddRecommendedPrompt";
import { ModalEditRecomendedPrompt } from "#/components/ModalEditRecommendedPrompt";
import { ModalDeletePrompt } from "#/components/ModalDeletePrompt/ModalDeletePrompt";
import { InputFilter } from "#/components/Multiselect";
import { Filter } from "#/stores/filtersStore";
import { Dominio } from "#/stores/dominiosStore";
import { ModalEditFavoritePrompt } from "#/components/ModalEditFavoritePrompt";
import useUserStore from "#/stores/userStore";
import { updateDomains } from "#/utils/functions/updateDomains";

export const Prompts = () => {
  const navigate = useNavigate();
  const { recommendedPrompts, setRecommendedPrompt, favoritePrompts, setFavoritePrompt } =
    usePromptStore();
  const { user } = useUserStore();
  const [searchPrompt, setSearchPrompt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"recommended" | "favorite">("favorite");
  const [promptToEdit, setPromptToEdit] = useState<recommendedPrompt | Prompt>();
  const [promptToDelete, setPromptToDelete] = useState<recommendedPrompt | Prompt>();
  const [domainOptions, setDomainOptions] = useState<Filter[]>([]);
  const filteredFavoritePrompts = favoritePrompts.filter((item) =>
    item.titulo.toLowerCase().includes(searchPrompt.toLowerCase())
  );
  const tabFavoriteRef = useRef<HTMLDianaTabElement>(null);
  const tabRecommendedRef = useRef<HTMLDianaTabElement>(null);

  //Verifica quais dominios o admin pode gerenciar
  const adminDomains = user?.id_dominio.filter((i) => i.permissao === "admin");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("diana-tab-heading")) {
        if (target.textContent === "Prompts favoritos") {
          setActiveTab("favorite");
        }
        if (target.textContent === "Prompts sugeridos") {
          setActiveTab("recommended");
        }
      }
    };

    document.addEventListener("click", handleClick);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const selectedDomains = domainOptions
    .filter((item) => item.selected === true)
    .map((domain) => domain.name);

  const filteredPromptsByDomain =
    selectedDomains.length > 0
      ? recommendedPrompts.filter((prompt) => selectedDomains.includes(prompt.id_dominio))
      : recommendedPrompts;

  const updatePromptToDelete = (value: recommendedPrompt | Prompt) => {
    setPromptToDelete(value);
  };

  const updatePromptToEdit = (value: recommendedPrompt | Prompt) => {
    setPromptToEdit(value);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      console.log("error", "Não foi possível buscar os prompts recomendados");
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

  useEffect(() => {
    getPrompts();
    getDominios();
    getFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Container">
      <DianaSpacing appearance="xx-large"></DianaSpacing>
      <DianaBreadcrumb
        is-feedback="false"
        is-tablet-layout="false"
        className="Breadcrumb"
      >
        <DianaBreadcrumbItem
          label="Home"
          onClick={() => navigate("/")}
        ></DianaBreadcrumbItem>
        <DianaBreadcrumbItem label="Prompts"></DianaBreadcrumbItem>
      </DianaBreadcrumb>
      <DianaSpacing appearance="large"></DianaSpacing>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <DianaTitle as="h2" weight="focus" className="pageTitle">
          Prompts
        </DianaTitle>
      </div>
      <div>
        <DianaSpacing appearance="large"></DianaSpacing>
        <DianaTabs>
          <DianaSpacing appearance="large"></DianaSpacing>
          <DianaTab
            header="Prompts favoritos"
            open={activeTab === "favorite" && true}
            ref={tabFavoriteRef}
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
          <DianaTab
            header="Prompts sugeridos"
            open={activeTab === "recommended" && true}
            ref={tabRecommendedRef}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "60%" }}>
                <InputFilter
                  label="Filtre pelo domínio"
                  helpText=""
                  setSelect={setDomainOptions}
                  optionsList={domainOptions}
                  width="100%"
                ></InputFilter>
              </div>
              {(user?.super_admin ||
                user?.id_dominio.some((i) => i.permissao === "admin")) && (
                <DianaButton
                  appearance="primary"
                  disabled={false}
                  size="small"
                  onClick={() => {
                    openModal("addRecomendedPrompt");
                  }}
                >
                  Adicionar prompt
                </DianaButton>
              )}
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
                        mainAction={
                          user?.super_admin ||
                          adminDomains?.some((i) => i.dominio === prompt.id_dominio)
                            ? "edit"
                            : "apply"
                        }
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
        <ModalAddRecomendedPrompt
          handleUpdatePrompts={getPrompts}
        ></ModalAddRecomendedPrompt>
        <ModalEditRecomendedPrompt
          handleUpdatePrompts={getPrompts}
          currentPrompt={promptToEdit}
        ></ModalEditRecomendedPrompt>
        <ModalEditFavoritePrompt
          currentPrompt={promptToEdit}
          handleUpdatePrompts={getFavorites}
        ></ModalEditFavoritePrompt>
        <ModalDeletePrompt
          currentPrompt={promptToDelete}
          handleUpdatePrompts={
            promptToDelete?.type === "recommended" ? getPrompts : getFavorites
          }
        ></ModalDeletePrompt>
      </div>
    </div>
  );
};
