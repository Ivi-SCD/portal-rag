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
import { getAllUsersAPI, getDomainsAPI, postUserAPI, verifyLDAP_API } from "#/utils/apis";
import { DominioUsuario } from "#/types/DominioUsuario";
import { showToastFunction } from "#/utils/functions/ShowToast";
import { closeModal } from "#/utils/functions/OpenAndCloseModal";
import useUserStore from "#/stores/userStore";
import { User } from "#/types/User";

interface Props {
  handleCloseModal: (modalId: string) => void;
  handleUpdateUsers: () => void;
  currentDomain?: string;
}

export const ModalAddUser = ({
  handleCloseModal,
  currentDomain,
  handleUpdateUsers
}: Props) => {
  const [dominiosToSelect, setDominiosToSelect] = useState<Filter[]>([]);
  const [dominiosPrivados, setDominiosPrivados] = useState<Filter[]>([]);
  const currentDomainType = currentDomain
    ? dominiosToSelect.find((i) => i.name === currentDomain)?.type
    : undefined;
  const { user } = useUserStore();
  const [userLDAP, setUserLDAP] = useState<string>("");
  const [permission, setPermission] = useState<"admin" | "super_admin" | "user">(
    currentDomainType === "public" ? "admin" : "user"
  );
  const [errorUserLDAP, setErrorUserLDAP] = useState<string>("");
  const [errorDominios, setErrorDominios] = useState<string>();
  const [loadingCrudUsers, setLoadingCrudUsers] = useState<boolean>(false);
  const [userDominios, setUserDominios] = useState<string[]>(
    currentDomain ? [currentDomain] : []
  );

  const getDominios = async () => {
    try {
      const response = await getDomainsAPI();
      const currentFilters: Filter[] = [];
      response.map((item: Dominio) => {
        currentFilters.push({
          type: item.access,
          name: item.id_dominio,
          selected: item.id_dominio === currentDomain ? true : false
        });
      });
      setDominiosToSelect(currentFilters);
      setDominiosPrivados(currentFilters.filter((i) => i.type === "private"));
    } catch {
      console.log("Não foi possível buscar os domínios");
    }
  };

  useEffect(() => {
    getDominios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateUserDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dominiosToSelect, dominiosPrivados]);

  const updateUserDomains = () => {
    const filteredList = dominiosToSelect.filter((item) => item.selected === true);
    const stringList: string[] = [];
    filteredList.forEach((item) => stringList.push(item.name));
    setUserDominios(stringList);
  };

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

  const addUser = async () => {
    if (userLDAP != "") {
      try {
        const response = await getAllUsersAPI();
        const userSuperAdmin: User = response.find(
          (i: User) => i.ldap === userLDAP && i.super_admin
        );
        if (!userSuperAdmin) {
          setLoadingCrudUsers(true);
          try {
            const response = await verifyLDAP_API(userLDAP);
            if (response.mensagem === "Usuário encontrado!") {
              let domainToAddUser: string[] = [];
              if (currentDomain) {
                domainToAddUser = userDominios?.length ? userDominios : [currentDomain];
              } else {
                domainToAddUser = userDominios?.length ? userDominios : [];
              }
              try {
                if (permission === "super_admin") {
                  await postUserAPI(userLDAP.toLocaleLowerCase(), true, []);
                  showToastFunction("success", "Usuário criado com sucesso!");
                  handleCloseModal("addUser");
                  setUserLDAP("");
                  setPermission("user");
                  handleUpdateUsers();
                  setLoadingCrudUsers(false);
                } else {
                  if (userDominios.length < 1) {
                    setErrorDominios("Selecione um domínio para continuar.");
                    setLoadingCrudUsers(false);
                  } else {
                    const formattedDomains: DominioUsuario[] = [];
                    domainToAddUser?.forEach((item) =>
                      formattedDomains.push({
                        permissao: permission,
                        dominio: item
                      })
                    );
                    await postUserAPI(
                      userLDAP.toLocaleLowerCase(),
                      false,
                      formattedDomains
                    );
                    showToastFunction("success", "Usuário criado com sucesso!");
                    handleCloseModal("addUser");
                    setUserLDAP("");
                    setPermission("user");
                    handleUpdateUsers();
                    setLoadingCrudUsers(false);
                  }
                }
              } catch (error) {
                if (error instanceof Error) {
                  if (error.message === `Usuário já existe no domínio ${currentDomain}`) {
                    showToastFunction(
                      "error",
                      `Usuário já existe no domínio ${currentDomain}`
                    );
                    setLoadingCrudUsers(false);
                  } else {
                    showToastFunction("error", "Não foi possível adicionar o usuário!");
                    setLoadingCrudUsers(false);
                  }
                }
              }
            } else {
              setErrorUserLDAP("Por favor, insira um ldap válido.");
              setLoadingCrudUsers(false);
            }
          } catch {
            showToastFunction("error", "Não foi possível adicionar o usuário!");
            setLoadingCrudUsers(false);
          }
        } else {
          showToastFunction(
            "success",
            `${userSuperAdmin.ldap} já possui acesso a este domínio como Super Admin!`
          );
        }
      } catch {
        showToastFunction("error", "Não foi possível verificar o usuário!");
      }
    } else {
      setErrorUserLDAP("Esse campo é obrigatório");
      setLoadingCrudUsers(false);
    }
  };

  return (
    <DianaModal
      label={currentDomainType === "public" ? "Adicionar admin" : "Adicionar usuário"}
      size="large"
      id="addUser"
      onModalClosed={() => {
        setUserLDAP("");
        setPermission("user");
        !currentDomain && getDominios();
      }}
      onModalOpened={() => {
        currentDomainType === "public" ? setPermission("admin") : setPermission("user");
      }}
    >
      <DianaInput
        label="Ldap do usuário"
        helpermessage="Digite o ldap"
        name="admin"
        value={userLDAP.toLocaleLowerCase()}
        onChanged={(e) => {
          setUserLDAP(e.target.value.trim().toLocaleLowerCase());
          setErrorUserLDAP("");
        }}
        errormessage={errorUserLDAP != "" ? errorUserLDAP : ""}
        required
      ></DianaInput>

      <div>
        {(!currentDomain || currentDomainType === "private") && (
          <>
            <DianaSpacing appearance="small"></DianaSpacing>
            <p className="placeholder">Tipo de acesso</p>
            <DianaSpacing appearance="small"></DianaSpacing>
            <DianaRadioGroup
              name="check-group-1"
              style={{ display: "flex", gap: "32px" }}
            >
              {user?.super_admin && !currentDomain && (
                <DianaRadioButton
                  label="Super admin"
                  value="super_admin"
                  onClick={() => setPermission("super_admin")}
                  checked={permission === "super_admin" && true}
                ></DianaRadioButton>
              )}

              <DianaRadioButton
                label="Admin"
                value="admin"
                onClick={() => setPermission("admin")}
                checked={permission === "admin" && true}
              ></DianaRadioButton>

              <DianaRadioButton
                label="Colaborador"
                value="user"
                checked={permission === "user" && true}
                onClick={() => setPermission("user")}
              ></DianaRadioButton>
            </DianaRadioGroup>
          </>
        )}
      </div>

      <div>
        {permission != "super_admin" && (
          <>
            <DianaSpacing appearance="small"></DianaSpacing>
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
              setUserLDAP("");
              setPermission("user");
              !currentDomain && getDominios();
              closeModal("addUser");
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
            onClick={addUser}
            disabled={loadingCrudUsers}
          >
            Enviar
          </DianaButton>
        </div>
      </span>
    </DianaModal>
  );
};
