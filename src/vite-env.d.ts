/// <reference types="vite/client" />

interface Window {
  auth: {
    [key: string]: any;
  };
  env: {
    BFF_URL: string;
  };
  Devtools: {
    [key: string]: any;
  };
  appVersion: string;
}

interface ImportMetaEnv {
  readonly VITE_APP_ID: string;
  readonly VITE_MOCK_API: string;
  readonly VITE_MOCK_AUTH: string;
  readonly VITE_APP_BFF_URL: string;
  readonly VITE_APP_DEFAULT_ENV: string;
}
