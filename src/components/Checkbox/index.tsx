import { Filter } from "#/stores/filtersStore";
import { DianaIcon } from "@diana-kit/react";
import "./index.scss";

interface Props {
  item: Filter;
  onClick: () => void;
}

export const Checkbox = ({ item, onClick }: Props) => {
  return (
    <div onClick={onClick} className="CheckBox-Item">
      <input
        type="checkbox"
        id={`${item.name}-checkbox`}
        name="teste222"
        data-input=""
        hidden
        onChange={onClick}
      />
      <span className="checkbox-icon">
        {item.selected ? (
          <DianaIcon
            filename="icCheckboxSelected_24_NoFill"
            description="Ícone de um quadrado com conteúdo preenchido"
          ></DianaIcon>
        ) : (
          <DianaIcon
            filename="icCheckboxUnselected_24_NoFill"
            description="Ícone de um quadrado sem conteúdo preenchido"
          ></DianaIcon>
        )}
      </span>
      <label
        id={`${item.name}-checkbox-label`}
        htmlFor={`${item.name}-checkbox`}
        className="sicredi-checkbox-single-label"
      >
        {item.name}
      </label>
    </div>
  );
};
