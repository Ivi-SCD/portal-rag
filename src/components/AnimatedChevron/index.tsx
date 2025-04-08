import { DianaIcon } from "@diana-kit/react";
import "./index.scss";

type Props = {
  isOpen: boolean;
  color: string;
  onClick: (value: boolean) => void;
};

export const AnimatedChevron = ({ isOpen, color, onClick }: Props) => {
  return (
    <span
      className={isOpen ? "iconChevron close" : "iconChevron open"}
      onClick={() => onClick(!isOpen)}
    >
      <DianaIcon filename={"icChevronDown_24_NoFill"} color={color}></DianaIcon>
    </span>
  );
};
