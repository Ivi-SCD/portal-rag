import { ColumnData, RowData, Table } from "#/components/Table";
import useDominiosStore from "#/stores/dominiosStore";
import { Document, DocumentToSend } from "#/types/Document";
import { deleteDomainDocAPI, getDomainDocsAPI, postDomainDocsAPI } from "#/utils/apis";
import { closeModal, openModal } from "#/utils/functions/OpenAndCloseModal";
import { showToastFunction } from "#/utils/functions/ShowToast";
import {
  DianaButton,
  DianaCheckboxSingle,
  DianaFileUpload,
  DianaIcon,
  DianaInput,
  DianaLoader,
  DianaModal,
  DianaParagraph,
  DianaSpacing,
  DianaTitle
} from "@diana-kit/react";
import { DianaFileUploadCustomEvent, DianaFileUploadTypes } from "@diana-kit/web";
import { useEffect, useState } from "react";

interface TabDocumentosType {
  currentDomain: string;
}

interface RepeatedDoc {
  name: string;
  selected: boolean;
}

export const TabDocumentos = ({ currentDomain }: TabDocumentosType) => {
  const { dominios } = useDominiosStore();
  const [docRows, setDocRows] = useState<RowData[]>([]);
  const [docToDelete, setDocToDelete] = useState<string>("");
  const [filelist, setFilelist] = useState<File[]>([]);
  const [repeatedDocs, setRepeatedDocs] = useState<RepeatedDoc[]>([]);
  const [loadingCrudDocs, setLoadingCrudDocs] = useState<boolean>(false);
  const [searchDoc, setSearchDoc] = useState<string>("");
  const [buttonIsDisabled, setButtonIsDisabled] = useState<boolean>(false);
  const docBoxFileUpload = document.getElementsByClassName(
    "wrapper-file-item sc-diana-file-item sc-diana-file-upload"
  );

  if (docBoxFileUpload.length > 0) {
    for (let i = 0; i < docBoxFileUpload.length; i++) {
      docBoxFileUpload[i].setAttribute("title", docBoxFileUpload[i].textContent!);
    }
  }

  const docRowsFiltered = docRows.filter((row) =>
    row.columns[0].label?.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const docsColumns: ColumnData[] = [
    {
      id: 0,
      label: "Nome do documento",
      type: "string",
      width: "30vw",
      sortable: true,
      startSortable: true
    }, // width deve estar em vw para aplicar reticências ao ultrapassar o tamanho
    { id: 1, label: "Média de avaliações", type: "media", sortable: true },
    { id: 2, label: "Tamanho do arquivo", width: "16%", type: "bytes", sortable: true },
    { id: 3, label: "Data de upload", type: "date", sortable: true },
    { id: 4, label: "Responsável", type: "string", sortable: true },
    { id: 5, label: "" }
  ];

  const getDocs = async () => {
    try {
      const response = await getDomainDocsAPI(currentDomain!);
      const DocsRows: RowData[] = [];
      response.map((doc: Document, index: number) => {
        DocsRows.push({
          id: index,
          columns: [
            { label: doc.nome_documento },
            { label: doc.media ? doc.media : "-1" },
            { label: doc.tamanho ? doc.tamanho : "-1" },
            { label: doc.created_at },
            { label: doc.created_by },
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
                    onClick={() => ConfirmDeleteDoc(doc.nome_documento)}
                    style={{ cursor: "pointer" }}
                  ></DianaIcon>
                </div>
              )
            }
          ]
        });
      });
      setDocRows(DocsRows);
    } catch {
      console.error("Não foi possível buscar os documentos desse domínio");
      setDocRows([]);
    }
  };

  const sendDocs = async () => {
    if (!buttonIsDisabled) {
      const repeatedDocs: RepeatedDoc[] = [];
      filelist.forEach((doc) => {
        docRows.forEach((item) => {
          if (item.columns[0].label === doc.name) {
            repeatedDocs.push({
              name: doc.name,
              selected: false
            });
          }
        });
      });
      setRepeatedDocs(repeatedDocs);
      if (repeatedDocs.length < 1) {
        await callPostDocs(filelist);
      } else {
        openModal("repeatedDoc");
      }
    }
  };

  const replaceDocs = async () => {
    try {
      await deleteRepeatDocs();
      closeModal("repeatedDoc");
      const finalDocs = filelist.filter(
        (doc) =>
          !repeatedDocs.some(
            (repeatedDoc) => repeatedDoc.name === doc.name && !repeatedDoc.selected
          )
      );
      await callPostDocs(finalDocs);
      closeModal("add-doc");
    } catch {
      console.log("error", "Não foi possível excluir os documentos");
    }
  };

  const deleteRepeatDocs = async () => {
    const docdToReplace = repeatedDocs.filter((doc) => doc.selected === true);
    docdToReplace.forEach(async (item) => {
      try {
        await deleteDomainDocAPI(currentDomain!, item.name);
      } catch {
        console.log("error", "Não foi possível excluir o documento");
      }
    });
  };

  const callPostDocs = async (list: File[]) => {
    setLoadingCrudDocs(true);
    if (filelist && list.length > 0) {
      const docs: DocumentToSend[] = [];
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(",")[1] || "";
            resolve(base64 as string);
          };
          reader.readAsDataURL(file);
          reader.onerror = (error) => reject(error);
        });

      for (const item of list) {
        const base64 = await toBase64(item);
        docs.push({
          nome_documento: item.name,
          base64: base64 ? base64 : "",
          extensao: item.type
        });
      }

      try {
        await postDomainDocsAPI(currentDomain!, docs);
        if (list.length > 1) {
          showToastFunction(
            "success",
            `${list.length} arquivos foram adicionados com sucesso!`
          );
        } else {
          showToastFunction(
            "success",
            `${list.length} arquivo foi adicionado com sucesso!`
          );
        }
        await removeAllDocs();
        getDocs();
        closeModal("add-doc");
        setRepeatedDocs([]);
        setLoadingCrudDocs(false);
      } catch {
        showToastFunction("error", "Não foi possível enviar os documentos!");
        setLoadingCrudDocs(false);
        setFilelist([]);
        setRepeatedDocs([]);
      }
    } else {
      setLoadingCrudDocs(false);
    }
  };

  const updateDocsToReplace = (optionToChage: string) => {
    setRepeatedDocs((prevOptions) =>
      prevOptions.map((option) =>
        option.name === optionToChage ? { ...option, selected: !option.selected } : option
      )
    );
  };

  const deleteDoc = async (id: string) => {
    setButtonIsDisabled(true);
    try {
      await deleteDomainDocAPI(currentDomain!, id);
      closeModal("deleteDoc");
      showToastFunction("success", "Documento excluido com sucesso!");
      getDocs();
      setButtonIsDisabled(false);
    } catch {
      closeModal("deleteDoc");
      showToastFunction("error", "Não foi possível excluir o documento");
      setButtonIsDisabled(false);
    }
  };

  const ConfirmDeleteDoc = (docName: string) => {
    openModal("deleteDoc");
    setDocToDelete(docName);
  };

  const handleFileUploadChange = (e: DianaFileUploadCustomEvent<File[]>) => {
    setFilelist(e.detail);
    if (e.detail.some((i: DianaFileUploadTypes.FileWithError) => i.withError)) {
      setButtonIsDisabled(true);
    }
  };

  const handleRemoveFile = (
    e: DianaFileUploadCustomEvent<DianaFileUploadTypes.FileWithError>
  ) => {
    setFilelist(filelist.filter((file) => file.name != e.detail.name));
    buttonIsDisabled && setButtonIsDisabled(false);
    clearInputFileCache();
  };

  const clearInputFileCache = () => {
    const fileInput = document.getElementById("file-manager") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleErrorFileChange = (event: DianaFileUploadCustomEvent<boolean>) => {
    if (event.detail === true) {
      setButtonIsDisabled(true);
    } else {
      setButtonIsDisabled(false);
    }
  };

  useEffect(() => {
    getDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDomain, dominios]);

  const removeAllDocs = async () => {
    setFilelist([]);
    const trashIcons = document.querySelectorAll(
      ".icon-trash.sc-diana-file-item.sc-diana-file-upload.hydrated"
    );

    for (let i = trashIcons.length - 1; i >= 0; i--) {
      await new Promise<void>((resolve) => {
        (trashIcons[i] as HTMLElement).click();
        resolve();
      });
    }

    const fileInput = document.getElementById("file-manager") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      event.preventDefault();
      await removeAllDocs();
    };

    const closeButton = document.querySelector("button.close") as HTMLButtonElement;
    if (closeButton) {
      closeButton.addEventListener("click", handleClick);
    }

    return () => {
      if (closeButton) {
        closeButton.removeEventListener("click", handleClick);
      }
    };
  }, []);

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
              Documentos
            </DianaTitle>
          </div>
          <DianaSpacing appearance="xx-small"></DianaSpacing>
          <DianaButton
            appearance="primary"
            disabled={false}
            size="small"
            onClick={() => openModal("add-doc")}
          >
            Adicionar documento
          </DianaButton>
        </div>
        <DianaSpacing appearance="medium"></DianaSpacing>

        <DianaInput
          label="Digite o nome do documento"
          name="docName"
          iconFilename="icSearch_16_NoFill"
          iconDescription="Icone de lupa"
          className="CampoPesquisaDoc"
          onChanged={(e) => setSearchDoc(e.target.value)}
        ></DianaInput>
        <DianaSpacing appearance="medium"></DianaSpacing>

        <Table
          columns={docsColumns}
          rows={docRowsFiltered}
          itemsPerPage={10}
          emptyMessage="Nenhum documento adicionado"
        ></Table>
      </div>
      <DianaModal
        label="Upload de arquivos"
        id="add-doc"
        onModalClosed={async () => {
          await removeAllDocs();
          clearInputFileCache();
        }}
      >
        <DianaFileUpload
          label="[Nome do arquivo]"
          acceptedFormats={["txt", "doc", "docx", "pdf", "xls", "xlsx", "pptx"]}
          maxFiles={10}
          allowedMegabytes={250}
          multiple={true}
          required
          onChanged={(e) => handleFileUploadChange(e)}
          onRemoved={(e) => handleRemoveFile(e)}
          onErrored={(e) => handleErrorFileChange(e)}
        ></DianaFileUpload>
        <DianaSpacing appearance="small"></DianaSpacing>
        <span style={{ display: "flex", gap: "30px", width: "100%" }}>
          {loadingCrudDocs ? (
            <DianaLoader show={true} style={{ marginTop: 20 }}></DianaLoader>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                <DianaButton
                  appearance="secondary"
                  size="block"
                  onClick={async () => {
                    await removeAllDocs();
                    closeModal("add-doc");
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
                  onClick={async () => {
                    await getDocs();
                    sendDocs();
                  }}
                  disabled={buttonIsDisabled}
                >
                  Enviar
                </DianaButton>
              </div>
            </>
          )}
        </span>
      </DianaModal>

      <DianaModal label="Excluir" size="large" id="deleteDoc">
        <DianaParagraph>
          <div
            style={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              overflowWrap: "break-word"
            }}
          >
            Deseja excluir o documento <b>{docToDelete}</b>?
          </div>
        </DianaParagraph>
        <DianaSpacing appearance="large"></DianaSpacing>
        <span style={{ display: "flex", gap: "30px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="secondary"
              size="block"
              onClick={() => closeModal("deleteDoc")}
              disabled={buttonIsDisabled}
            >
              Não
            </DianaButton>
          </div>
          <div style={{ flex: 1 }}>
            <DianaButton
              appearance="danger"
              size="block"
              onClick={() => deleteDoc(docToDelete)}
              disabled={buttonIsDisabled}
            >
              Sim
            </DianaButton>
          </div>
        </span>
      </DianaModal>
      <DianaModal
        label="Nome de documento existente"
        size="large"
        id="repeatedDoc"
        onModalClosed={() => setRepeatedDocs([])}
      >
        <div>
          <div>
            <span>
              {repeatedDocs.length < 2 ? (
                <DianaParagraph>
                  Há {repeatedDocs.length} documento com o mesmo nome que já foi enviado.
                  Se quiser substituí-lo, selecione-o abaixo.
                </DianaParagraph>
              ) : (
                <DianaParagraph>
                  Há {repeatedDocs.length} documentos com o mesmo nome que já foram
                  enviados. Se quiser substituí-los, selecione-os abaixo.
                </DianaParagraph>
              )}
            </span>

            <DianaSpacing appearance="small"></DianaSpacing>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {repeatedDocs.map((item, index) => {
                return (
                  <DianaCheckboxSingle
                    name={item.name}
                    label={item.name}
                    checked={item.selected}
                    onClick={() => updateDocsToReplace(item.name)}
                    key={index}
                    className="Item"
                  ></DianaCheckboxSingle>
                );
              })}
            </div>
          </div>
          <DianaSpacing appearance="large"></DianaSpacing>
          <span>
            <div style={{ display: "flex", gap: "30px", width: "100%" }}>
              <div style={{ flex: 1 }}>
                <DianaButton
                  appearance="secondary"
                  size="block"
                  onClick={() => {
                    closeModal("repeatedDoc");
                    setRepeatedDocs([]);
                  }}
                >
                  Cancelar
                </DianaButton>
              </div>
              <div style={{ flex: 1 }}>
                <DianaButton appearance="primary" size="block" onClick={replaceDocs}>
                  Substituir
                </DianaButton>
              </div>
            </div>
          </span>
        </div>
      </DianaModal>
    </div>
  );
};
