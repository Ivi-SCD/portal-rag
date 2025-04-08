import federation from "@originjs/vite-plugin-federation";

export const ModuleFederationRemoteSetup = () => {
  return federation({
    name: "canais-chatbot-rag-front-remote-app",
    filename: "remoteEntry.js",
    // Modules to expose
    exposes: {
      "./routes": "./src/routes"
    },
    shared: ["react", "react-router-dom", "@axa-fr/react-oidc"]
  });
};

export default ModuleFederationRemoteSetup;
