"use client";

import Fallback from "#/components/Fallback/index.tsx";
import "#/styles/global.scss";
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { DianaLoader } from "@diana-kit/react";
import { OidcProvider, OidcSecure } from "@axa-fr/react-oidc";
import oidcConfiguration from "./oidc.config";
import Forbidden from "./components/Forbidden";
import App from "./App";

const handleClose = () => {
  window?.auth?.actions?.logout();
  window?.location?.reload();
};

const loadingComponent = () => <DianaLoader show fullscreen />;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <OidcProvider
        configuration={oidcConfiguration}
        loadingComponent={loadingComponent}
        authenticatingComponent={loadingComponent}
        callbackSuccessComponent={loadingComponent}
        authenticatingErrorComponent={() => Forbidden({ handleClose })}
      >
        <OidcSecure>
          <App />
        </OidcSecure>
      </OidcProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
