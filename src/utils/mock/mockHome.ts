import { Filter } from "#/stores/filtersStore";

export const mockPublicDomains = [
  {
    access: "public",
    created_at: "2025-03-20",
    created_by: "superAdmin_ldap1",
    admin: ["admin_ldap1"],
    id_dominio: "dominio-publico-teste",
    updated_at: "2025-03-20"
  }
];

export const mockPrivateDomains = [
  {
    access: "private",
    created_at: "2025-03-20",
    created_by: "superAdmin_ldap1",
    admin: ["admin_ldap1"],
    id_dominio: "dominio-private-teste",
    updated_at: "2025-03-20"
  }
];

export const mockedFilters: Filter[] = [
  {
    type: "public",
    name: "dominio-publico-teste",
    selected: false
  },
  {
    type: "private",
    name: "dominio-privado-teste",
    selected: false
  }
];

export const mockedPublicFilters: Filter[] = [
  {
    type: "public",
    name: "dominio-publico-teste",
    selected: false
  }
];

export const mockedPrivateFilters: Filter[] = [
  {
    type: "private",
    name: "dominio-private-teste",
    selected: false
  }
];
