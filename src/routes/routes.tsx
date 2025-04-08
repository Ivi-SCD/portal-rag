import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import routesPaths, { RoutePaths } from ".";
import { BASE_NAME, PAGE } from "#/constants";
import Layout from "#/pages/Layout";
import { User } from "#/types/User";
import { getAllUsersAPI } from "#/utils/apis";
import useUserStore from "#/stores/userStore";
import { DianaLoader } from "@diana-kit/react";

const NotFound = lazy(() => import("#/pages/NotFound"));

const AppRoutes: React.FC = () => {
  const { user, updateUser } = useUserStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userPermission =
    user?.super_admin === true
      ? "super_admin"
      : user?.id_dominio.some((item) => item.permissao === "admin")
        ? "admin"
        : "user";
  const getPermission = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsersAPI();
      const user: User = response.find(
        (i: User) =>
          i.ldap ===
          JSON.parse(sessionStorage.getItem("oidc.default")!).tokens.idTokenPayload
            .preferred_username
      );
      updateUser(user);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderUserRoutes = () =>
    routesPaths().filter((i) => i.role.some((i) => i === userPermission));

  return (
    <Suspense>
      <BrowserRouter basename={BASE_NAME}>
        <Routes>
          {isLoading ? (
            <Route path="*" element={<DianaLoader show fullscreen />}></Route>
          ) : (
            <>
              <Route path={PAGE.ROOT()} element={<Layout />}>
                {renderUserRoutes().map((component: RoutePaths) =>
                  component.path === "Home" ? (
                    <Route key={component.path} index element={component.element} />
                  ) : (
                    <Route
                      key={component.path}
                      path={component.path}
                      element={component.element}
                    />
                  )
                )}
              </Route>
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export { AppRoutes as Routes };
