import "./index.scss";

type Props = {
  icon: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  testeId: string;
};

export const IconButton = ({ icon, description, onClick, disabled, testeId }: Props) => {
  return (
    <button
      className="IconButton"
      onClick={onClick}
      disabled={disabled}
      data-testid={testeId}
    >
      <img src={icon} alt={description}></img>
    </button>
  );
};
