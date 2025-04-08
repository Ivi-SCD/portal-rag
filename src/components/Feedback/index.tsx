import { DianaIcon, DianaSpacing } from "@diana-kit/react";
import "./index.scss";
import { useState } from "react";

type Props = {
  setFeedback: (value: "Like" | "Unlike" | null) => void;
};

export const Feedback = ({ setFeedback }: Props) => {
  const [selected, setSelected] = useState<"Like" | "Unlike" | null>(null);

  const handleLike = () => {
    if (selected === "Like") {
      setSelected(null);
      setFeedback(null);
    } else {
      setSelected("Like");
      setFeedback("Like");
    }
  };

  const handleUnLike = () => {
    if (selected === "Unlike") {
      setSelected(null);
      setFeedback(null);
    } else {
      setSelected("Unlike");
      setFeedback("Unlike");
    }
  };

  return (
    <div>
      <p className="SmallText">Essa resposta foi útil?</p>
      <DianaSpacing appearance="xx-small"></DianaSpacing>
      <div style={{ display: "flex", gap: "16px" }}>
        <button
          className={`FeedBackButton ${selected === "Like" && "Selected"}`}
          onClick={handleLike}
        >
          <DianaIcon filename={"icLike_16_NoFill"}></DianaIcon>
          <p className="SmallText">Sim</p>
        </button>
        <button
          className={`FeedBackButton ${selected === "Unlike" && "Selected"}`}
          onClick={handleUnLike}
        >
          <DianaIcon filename={"icUnlike_16_NoFill"}></DianaIcon>
          <p className="SmallText">Não</p>
        </button>
      </div>
    </div>
  );
};
