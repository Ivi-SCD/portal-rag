import {
  createMemoryRouter,
  MemoryRouterProps,
  RouteObject,
  RouterProvider
} from "react-router-dom";
import { afterEach } from "vitest";
import { cleanup, render, RenderOptions } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

afterEach(() => {
  cleanup();
});

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <h1>{children}</h1>;
};

type CustomRenderProps = {
  memoryRouter: Omit<MemoryRouterProps, "future">;
  routes: RouteObject[];
  renderOptions?: RenderOptions;
};

const customRender = (options: CustomRenderProps) => {
  const { memoryRouter, routes, renderOptions } = options;
  const router = createMemoryRouter(routes, memoryRouter);
  const user = userEvent.setup();

  return {
    ...render(<RouterProvider router={router} />, {
      ...renderOptions,
      wrapper: Wrapper
    }),
    router,
    user
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
