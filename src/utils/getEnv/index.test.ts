import { getEnv, getMockAddress } from ".";

type envTest = { env: string; host: string };
const urlsPossiveis: envTest[] = [
  // Localhost
  { env: "dev", host: "localhost:3000" },
  // k8s
  { env: "dev", host: "nome-da-aplicacao.dev.sicredi.cloud" },
  { env: "uat", host: "nome-da-aplicacao.uat.sicredi.cloud" },
  { env: "stress", host: "nome-da-aplicacao.stress.sicredi.cloud" },
  { env: "prd", host: "nome-da-aplicacao.prd.sicredi.cloud" },
  // k8s + haproxy sicredi
  { env: "dev", host: "sicredi.tst.sicredi.net" },
  { env: "uat", host: "sicredi.hom.sicredi.net" },
  { env: "stress", host: "sicredi.pre.sicredi.net" },
  { env: "prd", host: "sicredi.com.br" },
  // k8s + haproxy fundacao
  { env: "dev", host: "fundacao.tst.sicredi.net" },
  { env: "uat", host: "fundacao.hom.sicredi.net" },
  { env: "stress", host: "fundacao.pre.sicredi.net" },
  { env: "prd", host: "fundacao.sicredi.com.br" },
  // aplicacao com -sicredi.in
  { env: "dev", host: "nome-aplicacao.dev-sicredi.in" },
  { env: "uat", host: "nome-aplicacao.uat-sicredi.in" },
  { env: "stress", host: "nome-aplicacao.stress-sicredi.in" },
  { env: "prd", host: "nome-aplicacao.prd-sicredi.in" },
  // crm
  { env: "dev", host: "backendcrm.dev.sicredi.io" },
  { env: "uat", host: "backendcrm.uat.sicredi.io" },
  { env: "stress", host: "backendcrm.stress.sicredi.io" },
  { env: "prd", host: "backendcrm.sicredi.io" }
];

describe("getEnv", () => {
  test.each<envTest>(urlsPossiveis)("deve retornar $env em $host", ({ host, env }) => {
    vi.stubGlobal("location", { host });
    vi.stubGlobal("Devtools", undefined);
    expect(getEnv()).toBe(env);
  });
});

describe("Devtools", () => {
  beforeEach(() => {
    vi.stubGlobal("location", "localhost:4000");
    vi.stubGlobal("Devtools", {
      init: vi.fn(),
      mockAddress: () => "http://localhost:4000",
      currentEnvironment: () => "uat"
    });
  });

  it("deve retornar outros ambientes por conta da seleção no Devtools", () => {
    const env = getEnv();
    expect(env).toBe("uat");
  });

  it("deve mockar a URL", () => {
    expect(getMockAddress()).toBe("http://localhost:4000");
  });
});
