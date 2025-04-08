import "./index.scss";
import { Filter } from "#/stores/filtersStore";
import { useEffect, useRef, useState } from "react";
import { AnimatedChevron } from "../AnimatedChevron";
import { DianaButton, DianaCheckboxSingle } from "@diana-kit/react";

interface Props {
  label: string;
  helpText: string;
  setSelect: React.Dispatch<React.SetStateAction<Filter[]>>;
  optionsList: Filter[];
  errorMessage?: string;
  setErrorMessage?: React.Dispatch<React.SetStateAction<string | undefined>>;
  width?: string;
}

export const InputFilter = ({
  label,
  helpText,
  setSelect,
  optionsList,
  width,
  errorMessage,
  setErrorMessage
}: Props) => {
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [searchDomain, setSearchDomain] = useState<string>("");
  const selectedOptions = optionsList.filter((item) => item.selected === true);
  const selectBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && inputFocused) {
      inputRef.current.focus();
    }
  }, [inputFocused]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (selectBoxRef.current && !selectBoxRef.current.contains(event.target as Node)) {
        setInputFocused(false);
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [selectBoxRef]);

  const selectAll = () => {
    const currentFilters: Filter[] = [];
    optionsList.map((item) => {
      currentFilters.push({
        type: item.type,
        name: item.name,
        selected: true
      });
    });
    setSelect(currentFilters);
  };

  const deselectAll = () => {
    const currentFilters: Filter[] = [];
    optionsList.map((item) => {
      currentFilters.push({
        type: item.type,
        name: item.name,
        selected: false
      });
    });
    setSelect(currentFilters);
  };

  const updateOptions = (optionToChage: string) => {
    setErrorMessage && setErrorMessage(undefined);
    setSelect((prevOptions) =>
      prevOptions.map((option) =>
        option.name === optionToChage ? { ...option, selected: !option.selected } : option
      )
    );
  };

  const optionsFiltered = optionsList.filter((item) => item.name.includes(searchDomain));
  return (
    <div className="dianaInput" ref={selectBoxRef} style={{ width: width }}>
      <label id="input-1-label" className={`inputLabel label`} htmlFor="input-1">
        {label}
      </label>
      <div
        className="inputBox"
        style={{
          borderBottom: `2px solid ${errorMessage ? "#AA003C" : inputFocused ? "#33820d" : "#cdd3cd"}`,
          width: width
        }}
      >
        <input
          type="text"
          className="placeholder"
          readOnly
          id="input-1"
          name="input-1"
          aria-describedby="input-1-message"
          aria-labelledby="input-1-label"
          value={`${selectedOptions.length} itens selecionados`}
          onClick={() => setInputFocused(!inputFocused)}
        />
        <AnimatedChevron
          isOpen={inputFocused}
          color={"#33820d"}
          onClick={() => setInputFocused(!inputFocused)}
        ></AnimatedChevron>
      </div>
      {!inputFocused &&
        (errorMessage ? (
          <span
            id="input-1-message"
            className="helper-message ErrorMessageColor"
            aria-invalid="false"
          >
            {errorMessage}
          </span>
        ) : (
          <span id="input-1-message" className="helper-message" aria-invalid="false">
            {helpText}
          </span>
        ))}
      <div className={`MultiSelect ${!inputFocused && "Close"}`}>
        <input
          ref={inputRef}
          type="text"
          aria-autocomplete="list"
          aria-controls="downshift-0-menu"
          placeholder="Pesquisar..."
          data-multiple-select-focus={true}
          id="downshift-0-input"
          aria-labelledby="downshift-0-label"
          value={searchDomain}
          onChange={(e) => setSearchDomain(e.target.value)}
        />

        <div className="OptionsBox">
          {optionsFiltered.map((filter, index) => (
            <DianaCheckboxSingle
              name={filter.name}
              label={filter.name}
              checked={filter.selected}
              onClick={() => updateOptions(filter.name)}
              key={index}
              className="Item"
            ></DianaCheckboxSingle>
          ))}
        </div>

        <div className="ButtonsBox">
          <DianaButton onClick={selectAll}>Selecionar tudo</DianaButton>
          <DianaButton onClick={deselectAll}>Limpar tudo</DianaButton>
        </div>
      </div>
    </div>
  );
};
