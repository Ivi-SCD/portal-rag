import { DianaIcon, DianaTitle, DianaTooltip } from "@diana-kit/react";
import { ReactNode, useEffect, useRef } from "react";
import "#/components/Accordion/index.scss";
import { AnimatedChevron } from "../AnimatedChevron";

type Props = {
  label: string;
  children: ReactNode;
  isOpen: boolean;
  onClick: () => void;
  tooltipText: string;
};

export const FilterAccordion = ({
  label,
  children,
  isOpen,
  onClick,
  tooltipText
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.setProperty(
        "--content-height",
        `${contentRef.current.scrollHeight}px`
      );
    }
  }, [isOpen]);

  return (
    <div>
      <div
        className={`accordion_header ${isOpen ? "open" : "close"}`}
        onClick={() => onClick()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <DianaTitle as="h5">{label}</DianaTitle>
          <DianaTooltip placement="top" tip={tooltipText}>
            <DianaIcon
              filename="icWarning_16_NoFill"
              description="Ícone com a letra i de informações"
              color="#33820D"
            ></DianaIcon>
          </DianaTooltip>
        </div>
        <AnimatedChevron
          isOpen={isOpen}
          color={"#3FA110"}
          onClick={onClick}
        ></AnimatedChevron>
      </div>
      <div ref={contentRef} className={`accordion_content ${isOpen ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
};
