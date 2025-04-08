import NotFound from "#/pages/NotFound";
import useUserStore from "#/stores/userStore";
import React from "react";
import { useParams } from "react-router-dom";

interface Props {
  element: React.ReactNode;
  role: string[];
}

export const ProtectedRoute = ({ element }: Props) => {
  const { dominioName } = useParams();
  const { user } = useUserStore();

  const hasPermission =
    user?.id_dominio.some((i) => i.dominio === dominioName) &&
    user.id_dominio.find((i) => i.dominio === dominioName)?.permissao === "admin";

  if (!user?.super_admin && (!user || !hasPermission)) {
    return <NotFound />;
  } else {
    return element;
  }
};
