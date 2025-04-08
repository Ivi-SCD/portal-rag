import React from "react";
import { DianaButton, DianaCard } from "@diana-kit/react";

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const Fallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <DianaCard dismiss={true} header="Algo deu errado!">
      {error.message}
      <DianaButton
        iconPosition="left"
        iconFilename="icChevronLeft_16_NoFill"
        iconDescription="Seta para a esquerda"
        size="small"
        onClick={resetErrorBoundary}
      >
        Tentar novamente
      </DianaButton>
    </DianaCard>
  );
};

export default Fallback;
