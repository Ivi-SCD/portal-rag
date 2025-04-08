import { ModalAddUser } from "#/components/ModalAddUser";
import { ModalEditUser } from "#/components/ModalEditUser";
import { RowData, Table } from "#/components/Table";
import useUserStore from "#/stores/userStore";
import { User } from "#/types/User";
import { deleteUserAPI, getAllUsersAPI } from "#/utils/apis";
import { showToastFunction } from "#/utils/functions/ShowToast";
import {
  DianaBreadcrumb,
  DianaBreadcrumbItem,
  DianaButton,
  DianaIcon,
  DianaInput,
  DianaModal,
  DianaParagraph,
  DianaSpacing,
  DianaTitle
} from "@diana-kit/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Usuarios = () => {
  const navigate = useNavigate();
  const { updateUser } = useUserStore();
  const [rows, setRows] = useState<RowData[]>([]);
  const [userToDelete, setUserToDelete] = useState<string>("");
  const [userToEdit, setUserToEdit] = useState<User>();
  const [searchUser, setSearchUser] = useState<string>("");
  const [buttonIsDisabled, setButtonIsDisabled] = useState<boolean>(false);
  const usersRowsFiltered = rows.filter((row) =>
    row.columns[0].label?.includes(searchUser)
  );

  const getPermission = async () => {
    try {
      const response = await getAllUsersAPI();
      const user: User = response.find(
        (i: User) =>
          i.ldap ===
          JSON.parse(sessionStorage.getItem("oidc.default")!).tokens.idTokenPayload
            .preferred_username
      );
      updateUser(user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Columns = [
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
      const response = await getAllUsersAPI();
      const rowsList: RowData[] = [];
      response.map((user: User, index: number) => {
        const permission = user.id_dominio.some((item) => item.permissao === "admin");
        rowsList.push({
          id: index,
          columns: [
            { label: user.ldap },
            { label: user.nomeEntidade },
            { label: user.codCooperativa },
            {
              label: user.super_admin
                ? "Super admin"
                : permission
                  ? "Admin"
                  : "Colaborador"
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
                      openModal("deleteUserOfSystem");
                      setUserToDelete(user.ldap);
                    }}
                    style={{ cursor: "pointer" }}
                  ></DianaIcon>
                </div>
              )
            }
          ]
        });
      });
      setRows(rowsList);
    } catch {
      console.error("Não foi possível carregar os domínios");
    }
  };

  const deleteUser = async () => {
    setButtonIsDisabled(true);
    try {
      await deleteUserAPI(userToDelete);
      closeModal("deleteUserOfSystem");
      showToastFunction("success", "Usuário excluído com sucesso!");
      setButtonIsDisabled(false);
    } catch (error) {
      showToastFunction("error", "Não foi possível excluir o usuário!");
      closeModal("deleteUserOfSystem");
      setButtonIsDisabled(false);
    }
  };

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abre o modal de acordo com o id
  const openModal = (modalId: string) => {
    const modalComponent = document.getElementById(modalId) as any;
    modalComponent.open();
  };

  // Fecha o modal de acordo com o id
  const closeModal = (modalId: string) => {
    const modalComponent = document.getElementById(modalId) as any;
    modalComponent.close();
    getUsers();
  };

  return (
    <div className="Container">
      <DianaSpacing appearance="xx-large"></DianaSpacing>
      <DianaBreadcrumb
        is-feedback="false"
        is-tablet-layout="false"
        className="Breadcrumb"
      >
        <DianaBreadcrumbItem
          label="Home"
          onClick={() => navigate("/")}
        ></DianaBreadcrumbItem>
        <DianaBreadcrumbItem label="Usuários"></DianaBreadcrumbItem>
      </DianaBreadcrumb>
      <DianaSpacing appearance="large"></DianaSpacing>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <DianaTitle as="h2" weight="focus" className="pageTitle">
          Usuários
        </DianaTitle>
        <DianaSpacing appearance="xx-small"></DianaSpacing>
        <DianaButton
          appearance="primary"
          disabled={false}
          size="small"
          onClick={() => openModal("addUser")}
        >
          Adicionar usuário
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

      <DianaSpacing appearance="large"></DianaSpacing>
      <Table
        columns={Columns}
        rows={usersRowsFiltered}
        itemsPerPage={10}
        emptyMessage="Nenhum usuário adicionado"
      ></Table>
      <ModalAddUser
        handleCloseModal={closeModal}
        handleUpdateUsers={getUsers}
        currentDomain={""}
      ></ModalAddUser>
      <ModalEditUser
        handleCloseModal={closeModal}
        handleUpdateUsers={getUsers}
        userToEdit={userToEdit}
      ></ModalEditUser>
      <DianaModal label="Excluir" size="large" id="deleteUserOfSystem">
        <DianaParagraph>
          Deseja excluir <b>{userToDelete}</b> do sistema?
        </DianaParagraph>
        <DianaSpacing appearance="large"></DianaSpacing>
        <span style={{ display: "flex", gap: "30px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="secondary"
              size="block"
              onClick={() => closeModal("deleteUserOfSystem")}
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
      </DianaModal>
    </div>
  );
};
