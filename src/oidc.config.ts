// import { APPLICATION } from "./constants";

import { APPLICATION } from "./constants";

const oidcConfiguration = {
  // Este valor deve ser configurado conforme o contexto de cada aplicacao
  client_id: "portal-rag-front",
  redirect_uri: `${window.location.origin}/authentication/callback`,
  scope: `openid`,
  authority: `https://api.${APPLICATION.ENV}-sicredi.in/auth/realms/employee`
};

export default oidcConfiguration;
