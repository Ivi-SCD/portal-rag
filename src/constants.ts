import { getEnv, getMockAddress } from "#/utils/getEnv";

export const APPLICATION = {
  ID: "portal-rag-front",
  NAME: "portal-rag-front",
  get BFF_URL() {
    const env = getEnv();
    if (env === "mock") {
      return getMockAddress();
    }

    /**
     * Lembre-se de confirmar qual url do BFF para o seu projeto
     */
    return window.env.BFF_URL;
  },
  get ENV() {
    return getEnv();
  },
  ROLES: {
    PERFIL_CONTRATA: "portal_pj_contrata_prd",
    PERFIL_SUSTENTACAO: "portal_pj_sustentacao"
  }
};

export const PAGE = {
  /**
   * PREFIX_PATH é utilizado para navegar entre rotas dentro do microfront
   * e não ter conflito com as rotas do portal host.
   */
  PREFIX_PATH: () => "./../",
  ROOT: () => "/"
};

export const BASE_NAME = "";
