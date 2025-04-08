import {
  DianaBreadcrumb,
  DianaBreadcrumbItem,
  DianaSpacing,
  DianaTab,
  DianaTabs
} from "@diana-kit/react";
import { useNavigate, useParams } from "react-router-dom";
import "#/pages/Dominios/DominioEspecifico/DominioEspecifico.scss";
import { useEffect, useState } from "react";
import useDominiosStore from "#/stores/dominiosStore";
import { TabPrompts } from "./TabPrompts/TabPrompts";
import { TabUsuarios } from "./TabUsuarios/TabUsuarios";
import { TabDocumentos } from "./TabDocumentos/TabDocumentos";
import { getDomainsAPI } from "#/utils/apis";

export const DominioEspecifico = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { dominios, setDominios } = useDominiosStore();
  const [activeTab, setActiveTab] = useState<"Documents" | "User" | "Prompt">(
    "Documents"
  );
  const currentDomain = params.dominioName;

  const getDomains = async () => {
    try {
      const response = await getDomainsAPI();
      setDominios(response);
    } catch (error) {
      console.log("Não foi possível carregar as informações do domínio:", error);
    }
  };

  useEffect(() => {
    getDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("diana-tab-heading")) {
        if (target.textContent === "Documentos") {
          setActiveTab("Documents");
        }
        if (target.textContent === "Usuários") {
          setActiveTab("User");
        }
        if (target.textContent === "Prompts") {
          setActiveTab("Prompt");
        }
      }
    };

    document.addEventListener("click", handleClick);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClick);
    };
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
        <DianaBreadcrumbItem
          label="Domínios"
          onClick={() => navigate("/Dominios")}
        ></DianaBreadcrumbItem>
        <DianaBreadcrumbItem label={currentDomain}></DianaBreadcrumbItem>
      </DianaBreadcrumb>

      <DianaSpacing appearance="large"></DianaSpacing>

      <h2 className="pageTitle">{currentDomain}</h2>

      <DianaSpacing appearance="large"></DianaSpacing>
      {dominios.length ? (
        <DianaTabs>
          <DianaTab open={activeTab === "Documents" ? true : false} header="Documentos">
            <TabDocumentos currentDomain={currentDomain!}></TabDocumentos>
          </DianaTab>

          <DianaTab header="Usuários" open={activeTab === "User" ? true : false}>
            <TabUsuarios currentDomain={currentDomain!}></TabUsuarios>
          </DianaTab>

          <DianaTab header="Prompts" open={activeTab === "Prompt" ? true : false}>
            <TabPrompts currentDomain={currentDomain!}></TabPrompts>
          </DianaTab>
        </DianaTabs>
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
          Não foi possível carregar as informações do domínio
        </div>
      )}
    </div>
  );
};
