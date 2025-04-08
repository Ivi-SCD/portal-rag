type Environment = "dev" | "uat" | "stress" | "prd" | "mock";
const internalEnv: {
  [k: string]: Environment;
} = {
  tst: "dev",
  hom: "uat",
  pre: "stress"
};

let hasDevtools = false;

if (window.location.host.startsWith("localhost")) {
  window.Devtools = (await import("@sicredi/dev-tools")).default;
}

export function getEnv(): Environment {
  if (window.Devtools) {
    if (!hasDevtools) {
      window.Devtools.init();
      hasDevtools = true;
    }

    return window.Devtools.currentEnvironment().toLowerCase();
  }

  const { host } = window.location;
  if (host.startsWith("localhost")) {
    return "dev";
  }

  const matches = host.match(
    /^(.*)(dev|tst|uat|hom|stress|pre|prd)[-.]sicredi\.(net|cloud|in|io)$/i
  );

  const env = matches?.[2];
  if (env) {
    return internalEnv[env] ?? env;
  }

  return "prd";
}

export function getMockAddress() {
  if (window.Devtools) {
    return window.Devtools.mockAddress();
  }

  return "";
}
