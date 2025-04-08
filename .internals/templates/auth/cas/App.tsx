import { useEffect } from "react";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import { Routes } from "#/routes/routes";

function App() {
  const { accessToken, accessTokenPayload } = useOidcAccessToken();
  const { logout } = useOidc();

  useEffect(() => {
    window.auth = {
      ...window.auth,
      user: accessTokenPayload,
      get token() {
        return accessToken;
      }
    };
  }, [accessToken, accessTokenPayload]);

  useEffect(() => {
    window.auth = {
      ...window.auth,
      actions: {
        logout
      }
    };
  }, [logout]);

  return (
    <>
      <main>
        <Routes />
      </main>
    </>
  );
}

export default App;
