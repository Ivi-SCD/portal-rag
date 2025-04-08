import { RatingType } from "#/components/BotMessageBox";
import { APPLICATION } from "#/constants";
import { DocumentToSend } from "#/types/Document";
import { DominioUsuario } from "#/types/DominioUsuario";
import axios from "axios";

const getHeader = () => {
  const token = JSON.parse(sessionStorage.getItem("oidc.default")!).tokens.accessToken;

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-LDAP-Usuario-Logado": JSON.parse(sessionStorage.getItem("oidc.default")!).tokens
        .idTokenPayload.preferred_username
    }
  };
};

const api = axios.create({
  baseURL: APPLICATION.BFF_URL,
  timeout: 300000
});

// -------- CHAT -------- //
export const postResponseChat = async (
  uuid: string,
  text: string,
  dominios: string[],
  sessionId: string,
  file?: File | null
) => {
  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(",")[1] || "";
        resolve(base64);
      };
      reader.readAsDataURL(file);
      reader.onerror = (error) => reject(error);
    });

  const response = await api.post(
    "/chat",
    {
      session_token: sessionId,
      id_mensagem: uuid,
      query: text,
      dominios: dominios,
      documento: file != null ? file?.name : [],
      base64: file != null && (await toBase64(file)),
      extensao: file != null && file.type
    },
    getHeader()
  );
  return response.data;
};

export const closeSession = async (sessionId: string) => {
  const response = await api.delete(`/apagar_memory_temp/${sessionId}`, getHeader());
  return response.data;
};

// -------- Prompts -------- //

export const getFavoritesPrompts = async () => {
  const response = await api.get(`/prompts_favoritos`, getHeader());
  return response.data;
};

export const postFavoritePrompt = async (text: string, titulo: string) => {
  const response = await api.post(
    `/prompts_favoritos/add`,
    {
      prompt: text.trim(),
      titulo: titulo
    },
    getHeader()
  );
  return response.data;
};

export const removeFavoritePrompt = async (titulo: string) => {
  const response = await api.delete(`/prompts_favoritos/${titulo}`, getHeader());
  return response.data;
};

export const editFavoritePrompt = async (
  titulo_antigo: string,
  titulo_novo: string,
  text: string
) => {
  const response = await api.put(
    `/prompts_favoritos/${titulo_antigo}`,
    {
      titulo: titulo_novo,
      prompt: text
    },
    getHeader()
  );
  return response;
};

export const postRecomendedPrompts = async (
  id_dominio: string,
  name: string,
  text: string
) => {
  const response = await api.post(
    `/prompts_recomendados/add/${id_dominio}`,
    {
      titulo: name,
      prompt: text,
      descricao: id_dominio
    },
    getHeader()
  );
  return response;
};

export const getRecomendedPrompts = async (id_dominio: string) => {
  const response = await api.get(`/prompts_recomendados/${id_dominio}`, getHeader());
  return response.data;
};

export const getAllRecommendedPrompts = async () => {
  const response = await api.get(`/prompts_recomendados/`, getHeader());
  return response.data;
};

export const deleteRecomendedPromptAPI = async (
  id_dominio: string,
  id_prompt: string
) => {
  const response = await api.delete(
    `/prompts_recomendados/delete/${id_dominio}/${id_prompt}`,
    getHeader()
  );
  return response.data;
};

export const editRecomendedPrompts = async (
  id_dominio_antigo: string,
  id_dominio_novo: string,
  id_prompt: string,
  name: string,
  text: string
) => {
  const response = await api.put(
    `/prompts_recomendados/edit/${id_dominio_antigo}/${id_prompt}`,
    {
      titulo: name,
      prompt: text,
      descricao: id_dominio_novo,
      id_dominio: id_dominio_novo
    },
    getHeader()
  );
  return response;
};

// -------- Feedbacks -------- //

export const postFeedback = async (
  sessionToken: string,
  uuid: string,
  resposta: string,
  is_liked: null | true | false,
  docs_retornados: RatingType[]
) => {
  const response = await api.post(
    `/metricas/add`,
    {
      session_token: sessionToken,
      id_mensagem: uuid,
      resposta: resposta,
      is_liked: is_liked,
      documentos_retornados: docs_retornados
    },
    getHeader()
  );
  return response.data;
};

// -------- Domínios -------- //
export const getDomainsPrivateAPI = async () => {
  const response = await api.get("/dominios_privados", getHeader());
  return response.data;
};

export const getPublicDomainsAPI = async () => {
  const response = await api.get("/dominios_publicos", getHeader());
  return response.data;
};

export const getDomainsAPI = async () => {
  const response = await api.get("/dominios", getHeader());
  return response.data;
};

export const verifyLDAP_API = async (ldap: string) => {
  const response = await api.post(
    "/verificar_ldap",
    {
      ldap: ldap
    },
    getHeader()
  );
  return response.data;
};

export const postDomainAPI = async (
  domainName: string,
  admin: string,
  access: "private" | "public"
) => {
  const response = await api.post(
    "/dominios",
    {
      id_dominio: domainName,
      access: access,
      admin: admin
    },
    getHeader()
  );
  return response.data;
};

export const getDomainInfosAPI = async (id_dominio: string) => {
  const response = await api.get(`/dominios/${id_dominio}`, getHeader());
  return response.data;
};

export const deleteDomainAPI = async (id_dominio: string) => {
  const response = await api.delete(`/dominios/${id_dominio}`, getHeader());
  return response.data;
};

export const getDomainDocsAPI = async (id_dominio: string) => {
  const response = await api.get(`/documentos/${id_dominio}`, getHeader());
  return response.data;
};

export const getDomainUsersAPI = async (id_dominio: string) => {
  const response = await api.get(`/usuarios/${id_dominio}`, getHeader());
  return response.data;
};

export const getDomainPromptsAPI = async (id_dominio: string) => {
  const response = await api.get(`/prompts_recomendados/${id_dominio}`, getHeader());
  return response.data;
};

export const deleteDomainDocAPI = async (id_dominio: string, nome_documento: string) => {
  const response = await api.delete(
    `/documentos/delete/${id_dominio}/${nome_documento}`,
    getHeader()
  );
  return response.data;
};

export const postDomainDocsAPI = async (id_dominio: string, docs: DocumentToSend[]) => {
  const response = await api.post(
    `/documentos/add/${id_dominio}`,
    {
      documentos: docs
    },
    getHeader()
  );
  return response.data;
};

// -------- Users -------- //
export const getAllUsersAPI = async () => {
  const response = await api.get(`/usuarios`, getHeader());
  return response.data;
};

export const postUserAPI = async (
  ldap: string,
  super_admin: boolean,
  id_dominio?: DominioUsuario[] | null
) => {
  const response = await api.post(
    `/usuarios/add`,
    {
      ldap,
      super_admin,
      id_dominio
    },
    getHeader()
  );
  return response;
};

export const deleteDomainUserAPI = async (id_dominio: string, ldap: string) => {
  const response = await api.delete(
    `/usuarios/delete/${id_dominio}/${ldap}`,
    getHeader()
  );
  return response.data;
};

export const deleteUserAPI = async (ldap: string) => {
  const response = await api.delete(`/usuarios/delete/${ldap}`, getHeader());
  return response.data;
};

export const editUserAPI = async (
  ldap: string,
  super_admin: boolean,
  id_dominio?: DominioUsuario[] | null
) => {
  const response = await api.put(
    `/usuarios/edit/${ldap}`,
    {
      super_admin,
      id_dominio
    },
    getHeader()
  );
  return response.data;
};
