import "./index.scss";

interface Props {
  progress: number;
  numMessages: number;
}

export const ProgressBar = ({ progress, numMessages }: Props) => {
  return (
    <div style={{ display: "flex", justifyContent: "end" }}>
      <div style={{ width: "300px" }}>
        <div className="ProgressBar">
          <div style={{ width: `${progress}%` }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p className="Caption" style={{ color: "#323C32" }}>
            Marcador de turno de mensagens
          </p>
          <p className="Caption" style={{ fontWeight: "700" }}>
            {numMessages}/30
          </p>
        </div>
      </div>
    </div>
  );
};
