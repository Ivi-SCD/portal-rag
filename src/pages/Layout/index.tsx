import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  DianaButtonPrimary,
  DianaIcon,
  DianaIllustration,
  DianaSpacing,
  DianaTitle,
  DianaToastContainer
} from "@diana-kit/react";
import "./index.scss";
import { useEffect, useRef, useState } from "react";
import { AnimatedChevron } from "#/components/AnimatedChevron";
import { useOidc } from "@axa-fr/react-oidc";
import useUserStore from "#/stores/userStore";
import { closeSession } from "#/utils/apis";
import { v4 as uuidv4 } from "uuid";
import useMessageStore from "#/stores/messagesStore";

const Layout: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useOidc();
  const [manageIsOpen, setManageIsOpen] = useState<boolean>(false);
  const modalManageRef = useRef<HTMLDivElement>(null);
  const sessionId = sessionStorage.getItem("sessionId");
  const { cleanMessages } = useMessageStore();

  const renewSessionId = () => {
    const newSessionId = uuidv4();
    sessionStorage.setItem("sessionId", newSessionId);
  };

  const deleteSession = async () => {
    try {
      await closeSession(sessionId!);
      renewSessionId();
      console.log("Sessão finalizada");
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const cleanSession = () => {
    deleteSession();
    renewSessionId();
    cleanMessages();
  };

  const backToHome = () => {
    if (location.pathname === "/Chat") {
      cleanSession();
      navigate("/");
    } else navigate("/");
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        modalManageRef.current &&
        !modalManageRef.current.contains(event.target as Node)
      ) {
        setManageIsOpen(false);
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [modalManageRef]);

  return (
    <div className="Layout" data-testid="layout">
      <header className="Header" data-testid="header">
        <div
          onClick={backToHome}
          style={{ cursor: "pointer" }}
          data-testid="logo-sicredi-layout"
        >
          <DianaIllustration name={"sicredi-logo-negative"}></DianaIllustration>
        </div>
        <div className="CentralContent">
          <div className="Navbar">
            <div ref={modalManageRef}>
              <span className="dropdown-menu-trigger" aria-haspopup="menu">
                <button
                  className="DropdownButton"
                  onClick={() => setManageIsOpen(!manageIsOpen)}
                  data-testid={"dropdown-button"}
                >
                  <DianaTitle as="h6">Gerenciar</DianaTitle>
                  <AnimatedChevron
                    isOpen={manageIsOpen}
                    color={"#FFFFFF"}
                    onClick={() => setManageIsOpen(!manageIsOpen)}
                  ></AnimatedChevron>
                </button>
              </span>
              <span
                // hidden={!manageIsOpen}
                className={`dropdown-menu-items ${manageIsOpen && "opend"}`}
                style={{
                  position: "absolute",
                  inset: "0px auto auto 0px",
                  margin: "0px",
                  left: "163px"
                }}
                ref={modalManageRef}
              >
                <div
                  className="DropdownMenu"
                  role="menu"
                  tabIndex={0}
                  aria-orientation="vertical"
                >
                  {(user?.super_admin ||
                    user?.id_dominio.some((i) => i.permissao === "admin")) && (
                    <div
                      className="Item"
                      onClick={() => {
                        navigate("/Dominios");
                        setManageIsOpen(!manageIsOpen);
                        location.pathname === "/Chat" && cleanSession();
                      }}
                    >
                      <DianaIcon
                        filename="icSettings_24_NoFill"
                        icon-description="Engrenagem representando a opção Domínios"
                        color={"#33820d"}
                        style={{ paddingRight: "8px" }}
                      ></DianaIcon>
                      Domínios
                    </div>
                  )}
                  {user?.super_admin && (
                    <div
                      className="Item"
                      onClick={() => {
                        navigate("/Usuarios");
                        setManageIsOpen(!manageIsOpen);
                        location.pathname === "/Chat" && cleanSession();
                      }}
                    >
                      <DianaIcon
                        filename="icInformalUser_24_NoFill"
                        icon-description="Desenho de uma pessoa somente com linhas simples"
                        color={"#33820d"}
                        style={{ paddingRight: "8px" }}
                      ></DianaIcon>
                      Usuários
                    </div>
                  )}

                  <div
                    className="Item"
                    onClick={() => {
                      navigate("/Prompts");
                      setManageIsOpen(!manageIsOpen);
                      location.pathname === "/Chat" && cleanSession();
                    }}
                  >
                    <DianaIcon
                      filename="icDocumentDefault_24_NoFill"
                      icon-description="Desenho de uma folha de papel somente com linhas simples"
                      color={"#33820d"}
                      style={{ paddingRight: "8px" }}
                    ></DianaIcon>
                    Prompts
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>
        <div style={{ width: "103px" }}>
          <DianaButtonPrimary
            iconFilename="icExit_16_NoFill"
            iconDescription="Sair"
            size="small"
            iconPosition="left"
            onClick={() => {
              cleanSession();
              logout();
            }}
          >
            <DianaTitle as="h6" className="TextWhite">
              Sair
            </DianaTitle>
          </DianaButtonPrimary>
        </div>
      </header>
      <div
        style={{
          position: "sticky",
          width: "630px",
          top: "100px",
          margin: "0 10px 0 auto",
          zIndex: 1000
        }}
      >
        <DianaToastContainer />
      </div>
      <Outlet></Outlet>
      <DianaSpacing appearance="xxx-large"></DianaSpacing>
    </div>
  );
};

export default Layout;
