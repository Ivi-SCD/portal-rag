import React from "react";
import { DianaCard, DianaButton } from "@diana-kit/react";

type ForbiddenProps = {
  handleClose: () => void;
};

const Forbidden: React.FC<ForbiddenProps> = ({ handleClose }) => (
  <DianaCard dismiss={true} header="Acesso Negado">
    Você não possui autorização para acessar essa aplicação.
    <DianaButton
      data-testid="forbidden-button"
      iconPosition="left"
      iconFilename="icChevronLeft_16_NoFill"
      iconDescription="Seta para a esquerda"
      size="small"
      onClick={() => handleClose()}
    >
      Voltar
    </DianaButton>
  </DianaCard>
);

export default Forbidden;
