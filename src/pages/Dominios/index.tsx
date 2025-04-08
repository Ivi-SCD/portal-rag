import {
  DianaBreadcrumb,
  DianaBreadcrumbItem,
  DianaButton,
  DianaIcon,
  DianaInput,
  DianaModal,
  DianaParagraph,
  DianaRadioButton,
  DianaRadioGroup,
  DianaSpacing,
  DianaTitle
} from "@diana-kit/react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { RowData, Table } from "#/components/Table";
import useDominiosStore, { Dominio } from "#/stores/dominiosStore";
import {
  deleteDomainAPI,
  getAllUsersAPI,
  getDomainsAPI,
  postDomainAPI,
  postUserAPI,
  verifyLDAP_API
} from "#/utils/apis";
import { useEffect, useRef, useState } from "react";
import { User } from "#/types/User";
import { showToastFunction } from "#/utils/functions/ShowToast";
import useUserStore from "#/stores/userStore";

export const Dominios = () => {
  const navigate = useNavigate();
  const { setDominios, dominios } = useDominiosStore();
  const { user, updateUser } = useUserStore();
  const [domainName, setDomainName] = useState<string>("");
  const [admim, setAdmin] = useState<string>("");
  const [rows, setRows] = useState<RowData[]>([]);
  const [typeAccess, setTypeAccess] = useState<"public" | "private">("public");
  const [domainToDelete, setDomainToDelete] = useState<string>("");
  const [errorDomainName, setErrorDomainName] = useState<string>("");
  const [errorAdminName, setErrorAdminName] = useState<string>("");
  const [buttonIsDisabled, setButtonIsDisabled] = useState<boolean>(false);
  const inputRef = useRef<HTMLDianaInputElement>(null);

  useEffect(() => {
    const currentInput = inputRef.current;
    if (currentInput) {
      currentInput.addEventListener("input", handleInputChange);
    }

    return () => {
      if (currentInput) {
        currentInput.removeEventListener("input", handleInputChange);
      }
    };
  }, []);

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const regex = /[^a-zA-Z0-9\s\u00C0-\u00FF]/g;
    if (regex.test(target.value)) {
      setErrorDomainName("Caracteres especiais não são permitidos.");
    } else {
      setErrorDomainName("");
    }
    setDomainName(target.value.trim());
  };

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
      label: "Nome do domínio",
      type: "string",
      sortable: true,
      startSortable: true,
      width: "24vw"
    },
    { id: 1, label: "Admin", type: "string", sortable: true, width: "12vw" },
    { id: 2, label: "Tipo", type: "string", width: "10%", sortable: true },
    { id: 3, label: "Data de criação", type: "date", sortable: true, width: "18%" },
    { id: 4, label: "Última atualização", type: "date", sortable: true, width: "20%" },
    { id: 5, label: "Gerenciar", width: "10%" },
    { id: 6, label: "", width: "5%", hidden: user?.super_admin ? true : false }
  ];

  const getDominios = async () => {
    try {
      const response = await getDomainsAPI();
      setDominios(response);
      const rowsList: RowData[] = [];
      response.map((item: Dominio, index: number) => {
        rowsList.push({
          id: index,
          columns: [
            { label: item.id_dominio },
            {
              label:
                typeof item.admin === "string" && item.admin
                  ? item.admin
                  : Array.isArray(item.admin) && item.admin.length > 0
                    ? item.admin.join(", ")
                    : "Sem admin"
            },
            { label: item.access === "public" ? "Público" : "Privado" },
            { label: item.created_at },
            {
              label:
                item.updated_at === undefined ? "00-00-0000 00:00:00" : item.updated_at
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
                    filename="icSettings_24_NoFill"
                    icon-description="Engrenagem representando a opção Domínios"
                    color={"#33820d"}
                    onClick={() => navigate(`/Dominios/${item.id_dominio}`)}
                    style={{ cursor: "pointer" }}
                    data-testid="trash-icon-dominios"
                  ></DianaIcon>
                </div>
              )
            },
            {
              element: user?.super_admin && (
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
                    onClick={() => ConfirmDeleteDomain(item.id_dominio)}
                    style={{ cursor: "pointer" }}
                  ></DianaIcon>
                </div>
              )
            }
          ]
        });
      });
      setRows(rowsList);
    } catch (error) {
      console.error("Não foi possível carregar os domínios", error);
    }
  };

  const deleteDomain = async (id: string) => {
    try {
      await deleteDomainAPI(id);
      showToastFunction("success", "Domínio excluído com sucesso!");
      closeModal("deleteDomain");
      getDominios();
    } catch {
      showToastFunction("error", "Não foi possível excluir o domínio!");
      closeModal("deleteDomain");
    }
  };

  const ConfirmDeleteDomain = (id_dominio: string) => {
    openModal("deleteDomain");
    setDomainToDelete(id_dominio);
  };

  useEffect(() => {
    getDominios();
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
  };

  const handleCreate = async () => {
    dominios.some((i) => i.id_dominio === domainName) &&
      setErrorDomainName("Este domínio já existe. Por favor, escolha outro nome.");
    domainName === "" && setErrorDomainName("Esse campo é obrigatório");
    admim === "" && setErrorAdminName("Esse campo é obrigatório");
    if (typeAccess && admim != "" && domainName != "" && errorDomainName === "") {
      setButtonIsDisabled(true);
      try {
        const response = await verifyLDAP_API(admim);
        if (response.mensagem === "Usuário encontrado!") {
          const users = await getAllUsersAPI();
          const registeredUser = users.find((user: User) => user.ldap === admim);
          if (registeredUser) {
            await postDomainAPI(
              domainName.replace(/[<>]/g, ""),
              admim.replace(/[<>]/g, ""),
              typeAccess
            );
            showToastFunction("success", "Domínio criado com sucesso!");
            getDominios();
            closeModal("modalNewDomain");
            setDomainName("");
            setAdmin("");
            setButtonIsDisabled(false);
          } else {
            try {
              await postDomainAPI(
                domainName.replace(/[<>]/g, ""),
                admim.replace(/[<>]/g, ""),
                typeAccess
              );
              await postUserAPI(admim, false, [
                {
                  permissao: "admin",
                  dominio: domainName
                }
              ]);
              showToastFunction("success", "Domínio criado com sucesso!");
              getDominios();
              closeModal("modalNewDomain");
              setDomainName("");
              setAdmin("");
              setButtonIsDisabled(false);
            } catch (error) {
              showToastFunction("error", "Não foi possível criar o domínio!");
              setButtonIsDisabled(false);
            }
          }
        } else {
          setErrorAdminName("Por favor, insira um ldap válido.");
          setButtonIsDisabled(false);
        }
      } catch {
        setButtonIsDisabled(false);
        setErrorAdminName("Por favor, insira um ldap válido.");
      }
    }
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
        <DianaBreadcrumbItem label="Domínios"></DianaBreadcrumbItem>
      </DianaBreadcrumb>
      <DianaSpacing appearance="large"></DianaSpacing>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "10%" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DianaTitle as="h2" weight="focus" className="pageTitle">
            Domínios
          </DianaTitle>
          <DianaSpacing appearance="xx-small"></DianaSpacing>
          <DianaTitle as="h4" className="description">
            Domínios de conhecimento são espaços para você adicionar documentos e
            compartilhar com sua equipe.
          </DianaTitle>
        </div>

        {user?.super_admin && (
          <DianaButton
            appearance="primary"
            size="small"
            onClick={() => openModal("modalNewDomain")}
          >
            Criar domínio
          </DianaButton>
        )}
      </div>
      <DianaSpacing appearance="large"></DianaSpacing>
      <Table
        columns={Columns}
        rows={rows}
        itemsPerPage={10}
        emptyMessage="Nenhum domínio adicionado"
      ></Table>
      <DianaModal
        label="Criar domínio"
        size="large"
        id="modalNewDomain"
        onModalClosed={() => {
          setDomainName("");
          setAdmin("");
          setTypeAccess("public");
          setErrorDomainName("");
        }}
      >
        <DianaInput
          label="Digite o nome do domínio"
          name="domainName"
          value={domainName}
          ref={inputRef}
          errormessage={errorDomainName != "" ? errorDomainName : ""}
          required
          maxlength={150}
        ></DianaInput>
        <DianaInput
          label="Quem você quer que administre seu domínio?"
          helpermessage="Digite o ldap"
          name="admin"
          value={admim.toLocaleLowerCase()}
          onChanged={(e) => {
            setAdmin(e.target.value.trim().toLocaleLowerCase());
            setErrorAdminName("");
          }}
          errormessage={errorAdminName != "" ? errorAdminName : ""}
          required
        ></DianaInput>
        <DianaSpacing appearance="small"></DianaSpacing>
        <p className="placeholder">Tipo de restrição</p>
        <DianaSpacing appearance="small"></DianaSpacing>
        <DianaRadioGroup name="check-group-1" style={{ display: "flex", gap: "32px" }}>
          <DianaRadioButton
            label="Público"
            value="public"
            automaticfocus={true}
            onClick={() => setTypeAccess("public")}
            checked={typeAccess === "public" && true}
          ></DianaRadioButton>
          <DianaRadioButton
            label="Privado"
            value="private"
            onClick={() => setTypeAccess("private")}
            checked={typeAccess === "private" && true}
          ></DianaRadioButton>
        </DianaRadioGroup>
        <DianaSpacing appearance="large"></DianaSpacing>
        <span style={{ display: "flex", gap: "30px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="secondary"
              size="block"
              onClick={() => {
                closeModal("modalNewDomain");
                setDomainName("");
                setAdmin("");
                setTypeAccess("public");
                setErrorDomainName("");
              }}
              disabled={buttonIsDisabled}
            >
              Cancelar
            </DianaButton>
          </div>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="primary"
              size="block"
              onClick={handleCreate}
              disabled={buttonIsDisabled}
            >
              Criar
            </DianaButton>
          </div>
        </span>
      </DianaModal>

      <DianaModal label="Excluir" size="large" id="deleteDomain">
        <DianaParagraph>
          Deseja excluir o domínio <b>{domainToDelete}</b>?
        </DianaParagraph>
        <DianaSpacing appearance="large"></DianaSpacing>
        <span style={{ display: "flex", gap: "30px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="secondary"
              size="block"
              onClick={() => closeModal("deleteDomain")}
              disabled={buttonIsDisabled}
            >
              Não
            </DianaButton>
          </div>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="danger"
              size="block"
              onClick={() => deleteDomain(domainToDelete)}
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
