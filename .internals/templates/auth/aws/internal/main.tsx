import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import Fallback from "#/components/Fallback/index.tsx";
import { createEmployeeOpenIdClient } from "@sicredi/authentication";
import { APPLICATION } from "#/constants";
import App from "#/App.tsx";
import "#/styles/global.scss";

const authentication = createEmployeeOpenIdClient(
  APPLICATION.ENV === "mock" ? "dev" : APPLICATION.ENV,
  APPLICATION.ID,
  window.location.href,
  false, // APPLICATION.EXTERNAL
  {
    onIdpLogout: () => {
      console.log("Sua sessão foi encerrada!");
      window.location.reload();
    },
    onRefreshTokenError: () => {
      console.log("Sua sessão encerrará em breve!");
    },
    onAuthenticationError: () => {
      console.log("Problema na autenticação!");
      window.location.reload();
    }
  }
);

authentication
  .authenticate()
  .then(async (auth) => {
    window.auth = {
      ...auth,
      user: authentication.getJwtIdToken()?.payload,
      get token() {
        return authentication.getAccessToken();
      },
      actions: {
        logout: authentication.logout.bind(authentication)
      }
    };

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <ErrorBoundary
          FallbackComponent={Fallback}
          onReset={() => {
            window.location.reload();
          }}
        >
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    if (err?.status && err?.status !== "URL_NOT_VERIFIED") {
      ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
          <ErrorBoundary
            FallbackComponent={Fallback}
            onReset={() => {
              window.location.reload();
            }}
          >
            <p>Erro de autenticação</p>
            <p>{JSON.stringify(err)}</p>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
    }
  });
