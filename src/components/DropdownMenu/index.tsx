import "./index.scss";
import { DianaCheckboxSingle } from "@diana-kit/react";
import { Filter } from "#/stores/filtersStore";

type Props = {
  options: Filter[];
  selectFunction: (name: string) => void;
  isOpen: boolean;
};

export const DropdowMenu = ({ options, selectFunction, isOpen }: Props) => {
  return (
    <div className={`DropdownMenu ${!isOpen && "Close"}`}>
      {options.map((filter, index) => (
        <DianaCheckboxSingle
          name={filter.name}
          label={filter.name}
          checked={filter.selected}
          onClick={() => selectFunction(filter.name)}
          key={index}
          className="Item"
        ></DianaCheckboxSingle>
      ))}
    </div>
  );
};
