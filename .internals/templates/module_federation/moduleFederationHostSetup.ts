import federation from "@originjs/vite-plugin-federation";

export const ModuleFederationHostSetup = () => {
  return federation({
    name: "@@HOST_APP@@-host-app",
    remotes: {
      remoteApp: "@@HOST_APP_URL@@"
    }
  });
};

export default ModuleFederationHostSetup;
