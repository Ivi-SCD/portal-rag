import { DianaIcon, DianaSpacing, DianaTitle } from "@diana-kit/react";
import "./index.scss";
import { DocumenteBox } from "../DocumentBox";
import { Feedback } from "../Feedback";
import { Rating } from "../Rating";
import { useEffect, useState } from "react";
import { postFeedback } from "#/utils/apis";
import { showToastFunction } from "#/utils/functions/ShowToast";

export type Documents = {
  id_dominio: string;
  nome_documento: string;
  conteudo_base64: string;
  extensao: string;
};

export type RatingType = {
  nome_documento: string;
  avaliacao: number;
  id_dominio: string;
};

interface botMessageType {
  uuid: string;
  text: string;
  documents?: Documents[];
}

export const BotMessage = ({ text, documents, uuid }: botMessageType) => {
  const [ratingList, setRatingList] = useState<RatingType[]>([]);
  const [feedback, setFeedback] = useState<"Like" | "Unlike" | null>();
  const linhas = text.split("\n");
  const storedSessionId = sessionStorage.getItem("sessionId");

  const saveFeedBacks = async () => {
    try {
      await postFeedback(
        storedSessionId!,
        uuid,
        text,
        !feedback ? null : feedback === "Like" ? true : false,
        ratingList
      );
      console.log("Feedback enviado!");
    } catch (error) {
      console.error("Feedback não enviado:", error);
    }
  };

  useEffect(() => {
    if (feedback != null || ratingList.length > 0) {
      saveFeedBacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, ratingList]);

  const formatedText = linhas.map((linha, index) => {
    const linhaCorrigida = linha.replace("```markdown", "").replace("```", "");
    return linhaCorrigida.split("**").map((k, i) => {
      return {
        text: k.trimStart(),
        bold: i % 2 !== 0,
        title: k.includes("##") ? true : false,
        index: index
      };
    });
  });

  const nomesVistos = new Set();
  const objetosUnicos = documents
    ? documents.filter((objeto) => {
        if (nomesVistos.has(objeto.nome_documento)) {
          return false;
        } else {
          nomesVistos.add(objeto.nome_documento);
          return true;
        }
      })
    : [];

  const updateRatingList = (docName: string, value: number, dominio: string) => {
    setRatingList((prevRatingList) => {
      const existingIndex = prevRatingList.findIndex(
        (item) => item.nome_documento === docName && item.id_dominio === dominio
      );

      if (existingIndex !== -1) {
        const updatedList = prevRatingList.map((item, index) =>
          index === existingIndex ? { ...item, avaliacao: value } : item
        );
        return updatedList;
      } else {
        return [
          ...prevRatingList,
          {
            nome_documento: docName,
            avaliacao: value,
            id_dominio: dominio
          }
        ];
      }
    });
  };

  const copyText = () => {
    const plainText = text
      .replace(/(\*|_)(.*?)\1/g, "$2") // Itálico
      .replace(/~~(.*?)~~/g, "$1") // Tachado
      .replace(/`(.*?)`/g, "$1") // Código inline
      .replace(/!\[.*?\]\(.*?\)/g, "") // Imagens
      .replace(/\[.*?\]\(.*?\)/g, "$1") // Links
      .replace(/#+\s(.*?)/g, "$1") // Cabeçalhos
      .replace(/>\s(.*?)/g, "$1"); // Citações

    navigator.clipboard
      .writeText(plainText)
      .then(() => {
        console.log("Texto copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar texto: ", err);
      });
  };

  const base64ToFile = (base64String: string, fileName: string, mimeType: string) => {
    try {
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return new File([blob], fileName, { type: mimeType });
    } catch (error) {
      showToastFunction("error", "Não foi possível baixar o arquivo!");
      return null;
    }
  };

  const handleDownload = (base64String: string, fileName: string, mimeType: string) => {
    const file = base64ToFile(base64String, fileName, mimeType);

    if (file) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("Falha ao criar o arquivo.");
    }
  };

  return (
    <div data-testid="bot-message-box">
      <div style={{ display: "flex", gap: "12px" }}>
        <DianaIcon
          filename="icSicrediIcon_24_FillPositive"
          description="logo do sicredi na cor verde"
        ></DianaIcon>
        <p className="Caption">Resposta gerada pela inteligência artificial</p>
      </div>
      <DianaSpacing appearance="small"></DianaSpacing>
      <div
        style={{
          whiteSpace: "normal",
          wordWrap: "break-word",
          overflowWrap: "break-word"
        }}
      >
        {formatedText.map((linha) => {
          return linha.map(({ text, bold, title }, i) => {
            if (bold) {
              return (
                <>
                  <strong key={i} className="title5Bold">
                    {text}{" "}
                  </strong>
                  {i === linha.length - 1 && <br />}
                </>
              );
            } else if (title) {
              return (
                <>
                  {text.replace("##", "").includes("#") ? (
                    <DianaTitle as="h5" weight="focus" key={i}>
                      {text.replace("###", "")}
                    </DianaTitle>
                  ) : (
                    <DianaTitle as="h4" weight="focus" key={i}>
                      {text.replace("##", "")}
                    </DianaTitle>
                  )}
                </>
              );
            } else {
              return (
                <>
                  <span
                    style={{
                      marginLeft: parseFloat(text[0]) ? 14 : text[0] === "-" ? 16 : 0
                    }}
                    key={i}
                    className="title5"
                  >
                    {text}
                  </span>
                  {i === linha.length - 1 && <br />}
                </>
              );
            }
          });
        })}
      </div>
      <DianaSpacing appearance="small"></DianaSpacing>
      <DianaIcon
        color="green"
        filename="icCopy_16_NoFill"
        description="Icone de duas folhas sobrepostas representando copiar mensagem"
        onClick={copyText}
        style={{ cursor: "pointer" }}
      ></DianaIcon>
      {documents && documents!.length > 0 && (
        <div className="RelatedDocs">
          <DianaSpacing appearance="small"></DianaSpacing>
          <DianaTitle as="h5" weight="focus">
            Documentos relacionados:
          </DianaTitle>
          <DianaSpacing appearance="xx-small"></DianaSpacing>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {objetosUnicos.map((item, index) => (
              <div
                key={index}
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {item.id_dominio != "temporario" ? (
                  <DocumenteBox
                    fileName={item.nome_documento}
                    download={() =>
                      handleDownload(
                        item.conteudo_base64,
                        item.nome_documento,
                        item.extensao
                      )
                    }
                  ></DocumenteBox>
                ) : (
                  <DocumenteBox fileName={item.nome_documento}></DocumenteBox>
                )}
                {item.id_dominio != "temporario" && (
                  <div style={{ display: "flex", gap: "16px", marginTop: "5px" }}>
                    {/* <p className="CustomTitle6">Paragrafo 5 / Página 10</p> */}
                    <Rating
                      updateRatingList={updateRatingList}
                      docName={item.nome_documento}
                      key={index}
                      dominio={item.id_dominio}
                    ></Rating>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <DianaSpacing appearance="small"></DianaSpacing>
      <Feedback setFeedback={setFeedback}></Feedback>
    </div>
  );
};
