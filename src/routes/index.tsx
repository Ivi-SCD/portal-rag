import React from "react";
import { Home } from "#/pages/Home";
import { Chat } from "#/pages/Chat/Index";
import { Prompts } from "#/pages/Prompts";
import { Dominios } from "#/pages/Dominios";
import { DominioEspecifico } from "#/pages/Dominios/DominioEspecifico/DominioEspecifico";
import { Usuarios } from "#/pages/Usuarios";
import { ProtectedRoute } from "#/components/ProtectedRoute";

export type RoutePaths = {
  path: string;
  element: React.ReactNode;
  role: ("admin" | "super_admin" | "user")[];
};

const routesPaths = (): RoutePaths[] => {
  return [
    {
      path: `Home`,
      element: <Home />,
      role: ["super_admin", "admin", "user"]
    },
    {
      path: `Chat`,
      element: <Chat />,
      role: ["super_admin", "admin", "user"]
    },
    {
      path: `Prompts`,
      element: <Prompts />,
      role: ["super_admin", "admin", "user"]
    },
    {
      path: `Dominios`,
      element: <Dominios />,
      role: ["super_admin", "admin"]
    },
    {
      path: `Dominios/:dominioName`,
      element: (
        <ProtectedRoute
          element={<DominioEspecifico />}
          role={["super_admin", "admin"]}
        ></ProtectedRoute>
      ),
      role: ["super_admin", "admin"]
    },
    {
      path: `Usuarios`,
      element: <Usuarios />,
      role: ["super_admin"]
    }
  ];
};

export default routesPaths;
