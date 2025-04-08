import { DominioUsuario } from "./DominioUsuario";

export interface User {
  created_at: string;
  id_dominio: DominioUsuario[];
  ldap: string;
  super_admin: boolean;
  updated_at: string;
  codCooperativa?: string;
  nomeEntidade: string;
}
