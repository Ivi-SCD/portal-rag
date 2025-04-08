import { StrictMode } from "react";
import { HeaderNavigationPortal, HeaderProps } from "@sicredi/header-navigation-portal";

import { Routes } from "#/routes/routes";

export function App() {
  const headerData: HeaderProps = {
    accessToken: window.auth.token,
    fullName: window.auth.user.name,
    logout: window.auth.actions.logout,
    pathBackoffice: window.location.pathname
  };

  return (
    <>
      <main>
        <StrictMode>
          <HeaderNavigationPortal data={headerData} />
          <Routes />
        </StrictMode>
      </main>
    </>
  );
}

export default App;
