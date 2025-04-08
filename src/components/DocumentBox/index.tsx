import { DianaIcon } from "@diana-kit/react";
import "./index.scss";

interface PropsDocBox {
  fileName: string;
  cleanFile?: () => void;
  download?: () => void;
}

export const DocumenteBox = ({ fileName, cleanFile, download }: PropsDocBox) => {
  return (
    <div className="DocumenteBox">
      <img src="\icons\Book_portal_de_ajuda.svg" alt="" />
      <h6
        title={fileName}
        className="titleH6"
        style={{
          cursor: `${download ? "pointer" : "default"}`,
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "30vw"
        }}
        onClick={download}
      >
        {fileName}
      </h6>
      {cleanFile && (
        <DianaIcon
          filename="icError_16_NoFill"
          color="#33820D"
          onClick={cleanFile}
        ></DianaIcon>
      )}
    </div>
  );
};
