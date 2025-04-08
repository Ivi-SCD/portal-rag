import { ModalAddUser } from "#/components/ModalAddUser";
import { ModalEditUser } from "#/components/ModalEditUser";
import { RowData, Table } from "#/components/Table";
import useDominiosStore from "#/stores/dominiosStore";
import { User } from "#/types/User";
import { deleteDomainUserAPI, getDomainUsersAPI } from "#/utils/apis";
import { closeModal, openModal } from "#/utils/functions/OpenAndCloseModal";
import { showToastFunction } from "#/utils/functions/ShowToast";
import {
  DianaButton,
  DianaIcon,
  DianaInput,
  DianaModal,
  DianaParagraph,
  DianaSpacing,
  DianaTitle
} from "@diana-kit/react";
import { useEffect, useState } from "react";

interface TabUsuariosType {
  currentDomain: string;
}

export const TabUsuarios = ({ currentDomain }: TabUsuariosType) => {
  const { dominios } = useDominiosStore();
  const [searchUser, setSearchUser] = useState<string>("");
  const [usersRows, setUsersRows] = useState<RowData[]>([]);
  const [userToDelete, setUserToDelete] = useState<string>("");
  const [userToEdit, setUserToEdit] = useState<User>();
  const usersRowsFiltered = usersRows.filter((row) =>
    row.columns[0].label?.includes(searchUser)
  );
  const [buttonIsDisabled, setButtonIsDisabled] = useState<boolean>(false);

  const usersColumns = [
    {
      id: 0,
      label: "Nome do usuário",
      type: "string",
      width: "34%",
      sortable: true,
      startSortable: true
    },
    { id: 1, label: "Empresa", width: "22%", type: "string", sortable: true },
    { id: 2, label: "Cooperativa", width: "14%", type: "number", sortable: true },
    { id: 3, label: "Tipo", type: "string", sortable: true },
    { id: 4, label: "" },
    { id: 5, label: "" }
  ];

  const getUsers = async () => {
    try {
      const response = await getDomainUsersAPI(currentDomain!);
      const UsersRows: RowData[] = [];
      response.map((user: User, index: number) => {
        const permission = user.id_dominio.find(
          (item) => item.dominio === currentDomain
        )?.permissao;
        UsersRows.push({
          id: index,
          columns: [
            { label: user.ldap },
            { label: user.nomeEntidade },
            { label: user.codCooperativa },
            {
              label:
                user.super_admin === true
                  ? "Super admin"
                  : permission === "user"
                    ? "Colaborador"
                    : "Admin"
            },
            {
              element: (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <DianaIcon
                    filename="icEdit_16_NoFill"
                    icon-description="Ícone de lápis"
                    color={"#33820d"}
                    onClick={() => {
                      setUserToEdit(user);
                      openModal("EditUser");
                    }}
                    style={{ cursor: "pointer" }}
                  ></DianaIcon>
                </div>
              )
            },
            {
              element: (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <DianaIcon
                    filename="icTrash_16_NoFill"
                    icon-description="Ícone de lixeira"
                    color={"#33820d"}
                    onClick={() => {
                      setUserToDelete(user.ldap);
                      openModal("deleteUser");
                    }}
                    style={{ cursor: "pointer" }}
                  ></DianaIcon>
                </div>
              )
            }
          ]
        });
      });
      setUsersRows(UsersRows);
    } catch {
      console.error("Não foi possível buscar os usuários desse domínio");
    }
  };

  const deleteUser = async () => {
    setButtonIsDisabled(true);
    try {
      await deleteDomainUserAPI(currentDomain!, userToDelete);
      closeModal("deleteUser");
      showToastFunction("success", "Usuário excluído com sucesso!");
      getUsers();
      setButtonIsDisabled(false);
    } catch (error) {
      showToastFunction("error", "Não foi possível excluir o usuário!");
      closeModal("deleteUser");
      setButtonIsDisabled(false);
    }
  };

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDomain, dominios]);

  return (
    <div>
      <DianaSpacing appearance="large"></DianaSpacing>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="TabTitles_DominioEspecifico">
            <DianaTitle as="h3" weight="focus">
              Usuários
            </DianaTitle>
          </div>

          <DianaSpacing appearance="xx-small"></DianaSpacing>
          <DianaButton
            appearance="primary"
            disabled={false}
            size="small"
            onClick={() => openModal("addUser")}
          >
            {dominios.find((i) => i.id_dominio === currentDomain)?.access === "public"
              ? "Adicionar admin"
              : "Adicionar usuário"}
          </DianaButton>
        </div>
        <DianaSpacing appearance="medium"></DianaSpacing>

        <DianaInput
          label="Digite o nome do usuário"
          name="userName"
          iconFilename="icSearch_16_NoFill"
          iconDescription="Icone de lupa"
          className="CampoPesquisaDoc"
          onChanged={(e) => setSearchUser(e.target.value)}
        ></DianaInput>

        <DianaSpacing appearance="medium"></DianaSpacing>

        <Table
          columns={usersColumns}
          rows={usersRowsFiltered}
          itemsPerPage={10}
          emptyMessage="Nenhum usuário adicionado"
        ></Table>
      </div>
      <ModalAddUser
        handleCloseModal={closeModal}
        handleUpdateUsers={getUsers}
        currentDomain={currentDomain!}
      ></ModalAddUser>
      <DianaModal label="Excluir" size="large" id="deleteUser">
        <div>
          <DianaParagraph>
            <>
              Deseja excluir <b>{userToDelete}</b> do domínio?
            </>
          </DianaParagraph>
          <DianaSpacing appearance="large"></DianaSpacing>
          <span style={{ display: "flex", gap: "30px", width: "100%" }}>
            <div style={{ flex: 1 }}>
              <DianaButton
                appearance="secondary"
                size="block"
                onClick={() => closeModal("deleteUser")}
                disabled={buttonIsDisabled}
              >
                Não
              </DianaButton>
            </div>
            <div style={{ flex: 1 }}>
              <DianaButton
                appearance="danger"
                size="block"
                onClick={deleteUser}
                disabled={buttonIsDisabled}
              >
                Sim
              </DianaButton>
            </div>
          </span>
        </div>
      </DianaModal>

      <ModalEditUser
        handleCloseModal={closeModal}
        handleUpdateUsers={getUsers}
        userToEdit={userToEdit}
        currentDomain={currentDomain}
      ></ModalEditUser>
    </div>
  );
};
