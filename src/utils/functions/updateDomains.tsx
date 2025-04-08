import { Dominio } from "#/stores/dominiosStore";
import { getDomainsPrivateAPI, getPublicDomainsAPI } from "../apis";

export const updateDomains = async (): Promise<Dominio[]> => {
  const [responsePrivate, responsePublics] = await Promise.allSettled([
    getDomainsPrivateAPI(),
    getPublicDomainsAPI()
  ]);

  const domains: Dominio[] = [];

  if (responsePrivate.status === "fulfilled") {
    domains.push(...responsePrivate.value);
  } else {
    console.error("Error fetching private domains:", responsePrivate.reason);
  }

  if (responsePublics.status === "fulfilled") {
    domains.push(...responsePublics.value);
  } else {
    console.error("Error fetching public domains:", responsePublics.reason);
  }

  return domains;
};
