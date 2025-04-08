import OidcClient from "@sicredi/authentication/dist/oidc-client";

enum POST_MESSAGE {
  POST_MESSAGE_NEGOTIATION_LOADED = "POST_MESSAGE_NEGOTIATION_LOADED",
  POST_MESSAGE_NEGOTIATION_REQUEST_TOKEN = "POST_MESSAGE_NEGOTIATION_REQUEST_TOKEN",
  POST_MESSAGE_NEGOTIATION_ERROR = "POST_MESSAGE_NEGOTIATION_ERROR"
}

enum TYPE_MESSAGE {
  FIRST_TOKENS = "FIRST_TOKENS",
  NEGOTIATION_TOKENS = "NEGOTIATION_TOKENS"
}

export const hasRole = (role: string) => window?.auth?.user?.roles?.includes(role);

export const hasSomeRole = (roles: string[]) =>
  roles.some((role) => window?.auth?.user?.roles?.includes(role));

export const authenticationFrames = (auth: OidcClient) => {
  window.addEventListener(
    "message",
    (event) => {
      console.info(`Received message: ${event.data} by ${event.origin}`);
      switch (event.data) {
        case POST_MESSAGE.POST_MESSAGE_NEGOTIATION_LOADED:
        case POST_MESSAGE.POST_MESSAGE_NEGOTIATION_REQUEST_TOKEN: {
          const token = auth.getAccessToken();
          event?.source?.postMessage?.(
            {
              type:
                event.data === POST_MESSAGE.POST_MESSAGE_NEGOTIATION_LOADED
                  ? TYPE_MESSAGE.FIRST_TOKENS
                  : TYPE_MESSAGE.NEGOTIATION_TOKENS,
              tokens: {
                accessToken: token
              }
            },
            "*" as WindowPostMessageOptions
          );
          console.info(`Sending token: ${token}`);
          break;
        }
        case POST_MESSAGE.POST_MESSAGE_NEGOTIATION_ERROR: {
          const eventSource = event.source as any;
          eventSource?.contentWindow?.location?.reload?.();
          break;
        }
      }
    },
    false
  );
};
