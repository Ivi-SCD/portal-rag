import { useNavigate } from "react-router-dom";
import {
  DianaBox,
  DianaButton,
  DianaIllustration,
  DianaParagraph,
  DianaSpacing,
  DianaTitle
} from "@diana-kit/react";
import { PAGE } from "#/constants";
import "./index.scss";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="not-found-container">
        <DianaBox>
          <DianaTitle>Página não encontrada</DianaTitle>
          <DianaSpacing appearance="large" />
          <DianaIllustration
            name="empty-state"
            title="Página não encontrada"
            aria-hidden="false"
            aria-label="página não foi encontrada"
          />
          <DianaSpacing appearance="large" />
          <DianaParagraph>Essa página não existe.</DianaParagraph>
          <DianaSpacing appearance="large" />
          <DianaButton
            iconPosition="left"
            iconFilename="icChevronLeft_16_NoFill"
            iconDescription="Seta para a esquerda"
            size="small"
            data-testid="not-found-button-back"
            onClick={() => navigate(PAGE.ROOT())}
          >
            Voltar para o início
          </DianaButton>
        </DianaBox>
      </div>
    </>
  );
};

export default NotFound;
