import { DianaButton, DianaParagraph, DianaSpacing, DianaTitle } from "@diana-kit/react";
import "./index.scss";
import { useEffect, useState } from "react";
import { Textarea } from "#/components/Textarea";
import { FilterAccordion } from "#/components/Accordion";
import { useNavigate } from "react-router-dom";
// import userEvent from "@testing-library/user-event";
import useMessageStore from "#/stores/messagesStore";
import useDominiosStore, { Dominio } from "#/stores/dominiosStore";
import useFilterStore, { Filter } from "#/stores/filtersStore";
import { v4 as uuidv4 } from "uuid";
import { openModal } from "#/utils/functions/OpenAndCloseModal";
import { ModalPromptsGallery } from "#/components/ModalPromptsGallery/ModalPromptsGallery";
import usePromptStore from "#/stores/promptsStore";
import { Checkbox } from "#/components/Checkbox";
import { updateDomains } from "#/utils/functions/updateDomains";

export const Home = () => {
  const navigate = useNavigate();
  const [dominiosPublicosOpen, setDominiosPublicosOpen] = useState<boolean>(false);
  const [dominiosPrivadosOpen, setDominiosPrivadosOpen] = useState<boolean>(false);
  const { promptToApply, setPromptToApply } = usePromptStore();
  const [userInput, setUserInput] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);
  const { filters, toggleFilter, setFilters } = useFilterStore();
  const { setDominios } = useDominiosStore();
  const { addMessage } = useMessageStore();

  const handleApply = (value: string) => {
    setUserInput(value);
  };

  let storedSessionId = sessionStorage.getItem("sessionId");
  if (!storedSessionId) {
    storedSessionId = uuidv4();
    sessionStorage.setItem("sessionId", storedSessionId!);
  }

  const updateDominios = async () => {
    try {
      const response = await updateDomains();
      setDominios(response);
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

  useEffect(() => {
    updateDominios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    promptToApply && setUserInput(promptToApply);
  }, [promptToApply]);

  sessionStorage.setItem("ExecuteInicialFunction", "true");

  const handleSend = () => {
    const uuidMessage = uuidv4();
    addMessage(uuidMessage, userInput, "user", fileUploaded && fileUploaded);
    navigate("Chat");
    setPromptToApply("");
  };

  const handleFileChange = (file: File | null) => {
    file != null ? setFileUploaded(file) : setFileUploaded(null);
  };

  const updateUserInput = (value: string | null) => {
    value != null && setUserInput(value);
  };

  return (
    <div data-testid="home">
      <div className="Banner" data-testid="banner">
        <div className="BannerContent">
          <DianaTitle as="h2" className="title">
            Boas-vindas ao Portal RAG, o Repositório de Aprendizado Generativo do Sicredi!
          </DianaTitle>
          <DianaParagraph>
            Aproveite o potencial da IA Generativa ao extrair o máximo de informações dos
            seus documentos, ou utilize os domínios de conhecimento compartilhados com
            você.
          </DianaParagraph>
        </div>
        <img
          src="\img\40-TRANSPARENCIA-01.jpg"
          alt="Imagem de uma mulher sorrindo apontando para um notebook"
          height={286}
        />
      </div>
      <section className="Container">
        <div className="FiltrosDominios" data-testid="filtros-dominios">
          {filters && (
            <>
              <p className="TypographyExtra">
                Selecione um domínio de base para sua conversa
              </p>
              <FilterAccordion
                label="Domínios públicos"
                isOpen={dominiosPrivadosOpen}
                onClick={() => setDominiosPrivadosOpen(!dominiosPrivadosOpen)}
                tooltipText="Domínios públicos são aqueles que não possuem restrições de acesso."
              >
                {filters.filter((item) => item.type === "public").length > 0 ? (
                  <>
                    {filters
                      .filter((item) => item.type === "public")
                      .map((item, index: number) => (
                        <Checkbox
                          item={item}
                          key={index}
                          onClick={() => toggleFilter(item.name)}
                        ></Checkbox>
                      ))}
                  </>
                ) : (
                  <div style={{ padding: "8px" }}>
                    No momento, não há domínios disponíveis
                  </div>
                )}
              </FilterAccordion>
              {filters.find((item) => item.type === "private") && (
                <FilterAccordion
                  label="Domínios privados"
                  isOpen={dominiosPublicosOpen}
                  onClick={() => setDominiosPublicosOpen(!dominiosPublicosOpen)}
                  tooltipText="Domínios privados são aqueles que você recebeu o acesso."
                  data-testid="dominios-privados"
                >
                  {filters
                    .filter((item) => item.type === "private")
                    .map((item, index) => (
                      <Checkbox
                        item={item}
                        key={index}
                        onClick={() => toggleFilter(item.name)}
                      ></Checkbox>
                    ))}
                </FilterAccordion>
              )}
            </>
          )}
        </div>
        <DianaSpacing appearance="large"></DianaSpacing>
        <div>
          {/* <p className="TypographyExtra">Inicie uma conversa:</p> */}
          <DianaSpacing appearance="xx-small"></DianaSpacing>
          <div className="PromptHome">
            <p className="TypographyExtra">Inicie uma conversa:</p>
            <DianaButton
              appearance="default"
              onClick={() => openModal("promptGallery")}
              data-testid="button-galeria-prompts"
            >
              <img src="\icons\Writing.svg"></img>
              Galeria de prompts
            </DianaButton>
          </div>
          <Textarea
            value={userInput}
            uploadState={updateUserInput}
            handleSendMessage={handleSend}
            onFileChange={handleFileChange}
            disabled={false}
            showFileName={fileUploaded ? true : false}
          ></Textarea>
        </div>
      </section>
      <ModalPromptsGallery handleApply={handleApply}></ModalPromptsGallery>
    </div>
  );
};
