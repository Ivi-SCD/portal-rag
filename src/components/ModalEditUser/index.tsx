import {
  DianaButton,
  DianaInput,
  DianaModal,
  DianaRadioButton,
  DianaRadioGroup,
  DianaSpacing
} from "@diana-kit/react";
import { useEffect, useState } from "react";
import { InputFilter } from "../Multiselect";
import { Filter } from "#/stores/filtersStore";
import { Dominio } from "#/stores/dominiosStore";
import { editUserAPI, getDomainsAPI } from "#/utils/apis";
import { User } from "#/types/User";
import { DominioUsuario } from "#/types/DominioUsuario";
import { showToastFunction } from "#/utils/functions/ShowToast";
import useUserStore from "#/stores/userStore";

interface Props {
  handleCloseModal: (modalId: string) => void;
  handleUpdateUsers: () => void;
  userToEdit?: User;
  currentDomain?: string;
}

export const ModalEditUser = ({
  handleCloseModal,
  userToEdit,
  currentDomain,
  handleUpdateUsers
}: Props) => {
  const [dominiosToSelect, setDominiosToSelect] = useState<Filter[]>([]);
  const [dominiosPrivados, setDominiosPrivados] = useState<Filter[]>([]);
  const currentDomainType = currentDomain
    ? dominiosToSelect.find((i) => i.name === currentDomain)?.type
    : undefined;
  const [permission, setPermission] = useState<"admin" | "super_admin" | "user">();
  const { user } = useUserStore();
  // const [access, setAccess] = useState<"active" | "inactive">();
  const [loadingCrudUsers, setLoadingCrudUsers] = useState<boolean>(false);
  const [errorDominios, setErrorDominios] = useState<string>();

  const getDominios = async () => {
    try {
      const response = await getDomainsAPI();
      const currentFilters: Filter[] = [];
      response.map((item: Dominio) => {
        currentFilters.push({
          type: item.access,
          name: item.id_dominio,
          selected:
            userToEdit!.id_dominio?.some(
              (domain) => domain.dominio === item.id_dominio
            ) ?? false
        });
      });
      setDominiosToSelect(currentFilters);
      setDominiosPrivados(currentFilters.filter((i) => i.type === "private"));
    } catch {
      console.log("Não foi possível buscar os domínios");
    }
  };

  useEffect(() => {
    if (userToEdit) {
      const permission = userToEdit.id_dominio.some((item) => item.permissao === "admin");
      setPermission(
        userToEdit.super_admin ? "super_admin" : permission ? "admin" : "user"
      );
      getDominios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToEdit]);

  useEffect(() => {
    if (permission === "user") {
      const currentFilters: Filter[] = [];
      dominiosPrivados.map((item) => {
        currentFilters.push({
          type: item.type,
          name: item.name,
          selected: item.name === currentDomain ? true : false
        });
      });
      setDominiosPrivados(currentFilters);
    }

    if (permission === "admin") {
      const currentFilters: Filter[] = [];
      dominiosToSelect.map((item) => {
        currentFilters.push({
          type: item.type,
          name: item.name,
          selected: item.name === currentDomain ? true : false
        });
      });
      setDominiosToSelect(currentFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  const editUser = async () => {
    setLoadingCrudUsers(true);
    const filteredList = dominiosToSelect.filter((item) => item.selected === true);
    const stringList: string[] = [];
    filteredList.forEach((item) => stringList.push(item.name));
    try {
      if (userToEdit) {
        if (permission === "super_admin") {
          await editUserAPI(userToEdit.ldap, true);
          showToastFunction("success", "Usuário editado com sucesso!");
          handleCloseModal("EditUser");
          handleUpdateUsers();
          setLoadingCrudUsers(false);
        } else {
          if (stringList.length > 0) {
            const formattedDomains: DominioUsuario[] = [];
            stringList?.forEach((item) =>
              formattedDomains.push({
                permissao: permission!,
                dominio: item
              })
            );
            await editUserAPI(userToEdit.ldap, false, formattedDomains);
            showToastFunction("success", "Usuário editado com sucesso!");
            handleCloseModal("EditUser");
            handleUpdateUsers();
            setLoadingCrudUsers(false);
          } else {
            setErrorDominios("Selecione um domínio para continuar.");
            setLoadingCrudUsers(false);
          }
        }
      }
    } catch (error) {
      showToastFunction("error", "Não foi possível editar o usuário!");
      setLoadingCrudUsers(false);
    }
  };

  return (
    <DianaModal
      label={currentDomainType === "public" ? "Editar admin" : "Editar usuário"}
      size="large"
      id="EditUser"
      onModalOpened={() => {
        if (userToEdit) {
          const permission = userToEdit.id_dominio.some(
            (item) => item.permissao === "admin"
          );
          setPermission(
            userToEdit.super_admin ? "super_admin" : permission ? "admin" : "user"
          );
          getDominios();
        }
      }}
    >
      <DianaInput
        label="Ldap do usuário"
        value={`${userToEdit?.ldap}`}
        disabled
      ></DianaInput>

      <div>
        {(!currentDomain || currentDomainType === "private") && (
          <>
            <p className="placeholder">Tipo de usuário</p>
            <DianaSpacing appearance="small"></DianaSpacing>
            <DianaRadioGroup
              name="check-group-1"
              style={{ display: "flex", gap: "32px" }}
            >
              {user?.super_admin && (
                <DianaRadioButton
                  label="Super admin"
                  value="super_admin"
                  onChanged={() => setPermission("super_admin")}
                  checked={permission === "super_admin" && true}
                ></DianaRadioButton>
              )}
              <DianaRadioButton
                label="Admin"
                value="admin"
                onChanged={() => setPermission("admin")}
                checked={permission === "admin" && true}
              ></DianaRadioButton>
              <DianaRadioButton
                label="Colaborador"
                value="user"
                checked={permission === "user" && true}
                onChanged={() => setPermission("user")}
              ></DianaRadioButton>
            </DianaRadioGroup>
            <DianaSpacing appearance="small"></DianaSpacing>
          </>
        )}
      </div>
      {/* <DianaSpacing appearance="small"></DianaSpacing>
      <p className="placeholder">Acesso</p>
      <DianaSpacing appearance="small"></DianaSpacing>
      <DianaRadioGroup
        name="check-group-2"
        value={access}
        style={{ display: "flex", gap: "32px" }}
      >
        <DianaRadioButton
          label="Ativo"
          value="active"
          automaticfocus={true}
          onClick={() => setAccess("active")}
          defaultChecked
        ></DianaRadioButton>
        <DianaRadioButton
          label="Inativo"
          value="inactive"
          automaticfocus={true}
          onClick={() => setAccess("inactive")}
          defaultChecked
        ></DianaRadioButton>
      </DianaRadioGroup> */}
      <div>
        {permission != "super_admin" && (
          <>
            <InputFilter
              label={"Indique a qual domínio deseja adicionar o usuário"}
              helpText={"Digite o domínio"}
              optionsList={permission === "admin" ? dominiosToSelect : dominiosPrivados}
              setSelect={
                permission === "admin" ? setDominiosToSelect : setDominiosPrivados
              }
              width="100%"
              errorMessage={errorDominios}
              setErrorMessage={setErrorDominios}
            ></InputFilter>
          </>
        )}
      </div>
      <DianaSpacing appearance="x-large"></DianaSpacing>
      <span style={{ display: "flex", gap: "30px", width: "100%" }}>
        <div style={{ flex: 1 }}>
          <DianaButton
            appearance="secondary"
            size="block"
            onClick={() => {
              handleCloseModal("EditUser");
            }}
            disabled={loadingCrudUsers}
          >
            Cancelar
          </DianaButton>
        </div>
        <div style={{ flex: 1 }}>
          <DianaButton
            appearance="primary"
            size="block"
            onClick={editUser}
            disabled={loadingCrudUsers}
          >
            Editar
          </DianaButton>
        </div>
      </span>
    </DianaModal>
  );
};
