import { DianaIcon, DianaTitle } from "@diana-kit/react";
import "./index.scss";
import { useEffect, useState } from "react";
import { Pagination } from "../Pagination";

export interface ColumnData {
  id: number;
  label: string;
  initiallyHidden?: boolean;
  type?: string;
  width?: string;
  maxWidth?: string;
  sortable?: boolean;
  startSortable?: boolean;
  hidden?: boolean;
}

export interface RowData {
  id: number | string;
  columns: {
    label?: string;
    element?: any;
    badge?: string;
    tip?: boolean;
  }[];
}

interface Props {
  columns: ColumnData[];
  rows: RowData[];
  itemsPerPage: number;
  emptyMessage: string;
}

export const Table = ({ columns, rows, emptyMessage, itemsPerPage }: Props) => {
  const sortable = columns.find((i) => i.startSortable === true);
  const [sortConfig, setSortConfig] = useState<{
    key: number | null;
    direction: "ascending" | "descending" | undefined;
  }>(
    sortable
      ? {
          key: columns[sortable!.id].id,
          direction: "ascending"
        }
      : {
          key: null,
          direction: undefined
        }
  );
  const [filterType, setFilterType] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const sortedData = [...rows].sort((a, b) => {
    if (sortConfig.key === null) return 0;

    const aValue = a.columns[sortConfig.key!].label;
    const bValue = b.columns[sortConfig.key!].label;

    const isNumber = (str: string | number) => !isNaN(Number(str));

    const compareStrings = (aStr: string, bStr: string) =>
      sortConfig.direction === "ascending"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);

    const compareDates = (aDate: Date | null, bDate: Date | null) => {
      if (!aDate && !bDate) return 0;
      if (!aDate) return sortConfig.direction === "ascending" ? 1 : -1;
      if (!bDate) return sortConfig.direction === "ascending" ? -1 : 1;

      return sortConfig.direction === "ascending"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    };

    const parseDate = (dateString: string) => {
      const parts = dateString.split(" ")[0].split("-");
      return parts[0] === "00" ? null : new Date(parts.reverse().join("-"));
    };

    if (filterType === "string") {
      const aStr = aValue ? aValue.toLowerCase() : "";
      const bStr = bValue ? bValue.toLowerCase() : "";
      return compareStrings(aStr, bStr);
    } else if (filterType === "date") {
      const aDate = aValue ? parseDate(aValue) : null;
      const bDate = bValue ? parseDate(bValue) : null;
      return compareDates(aDate, bDate);
    } else if (
      (filterType === "number" || filterType === "bytes" || filterType === "media") &&
      isNumber(aValue!) &&
      isNumber(bValue!)
    ) {
      return sortConfig.direction === "ascending"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    } else {
      return 0;
    }
  });

  const currentData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDate = (dateString: string) => {
    if (dateString != "00-00-0000 00:00:00") {
      const [day, month, year] = dateString.split(" ")[0].split("-");
      return `${day}/${month}/${year}`;
    } else {
      return "Sem atualizações";
    }
  };

  //Formata bytes para apresentar como B, KB ou MB
  const formatBytes = (size: number): string => {
    const kb = 1024;
    const mb = 1024 * kb;

    if (size === -1) {
      return "Não definido";
    } else if (size < kb) {
      return `${size} B`;
    } else if (size < mb) {
      const sizeInKB = size / kb;
      return `${parseFloat(sizeInKB.toFixed(2))} KB`;
    } else {
      const sizeInMB = size / mb;
      return `${parseFloat(sizeInMB.toFixed(2))} MB`;
    }
  };

  const formatMedia = (size: number): string => {
    if (size === -1) {
      return "Sem avaliação";
    } else {
      return `${size}/5`;
    }
  };

  const requestSort = (key: number, direction: "ascending" | "descending") => {
    setFilterType(columns.find((col) => col.id === key)?.type);
    setSortConfig({ key, direction });
  };

  const getAriaSort = (key: number) => {
    if (sortConfig.key === key) {
      return sortConfig.direction;
    }
    return "none";
  };

  useEffect(() => {
    if (sortable && sortConfig.direction != undefined) {
      requestSort(sortable.id, sortConfig.direction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setPageSize(itemsPerPage);
  }, [rows, itemsPerPage]);

  return (
    <div className="TableComponent">
      <table>
        <thead>
          <tr>
            {columns.map(
              (column, index) =>
                column.hidden != false && (
                  <th
                    style={{ width: column.width }}
                    key={index}
                    aria-sort={getAriaSort(column.id)}
                    scope="col"
                    className={column.label === "Gerenciar" ? "Gerenciar" : ""}
                  >
                    <span className="col">
                      <DianaTitle as="h6" weight="focus">
                        {column.label}
                      </DianaTitle>
                      {column.sortable && (
                        <>
                          {sortConfig.key === column.id ? (
                            sortConfig.direction === "ascending" ? (
                              <DianaIcon
                                filename="icOrderDown_16_NoFill"
                                description="Icone de ordenação"
                                color="#3FA110"
                                onClick={() => requestSort(column.id, "descending")}
                              ></DianaIcon>
                            ) : (
                              <DianaIcon
                                filename="icOrderUp_16_NoFill"
                                description="Icone de ordenação"
                                color="#3FA110"
                                onClick={() => requestSort(column.id, "ascending")}
                              ></DianaIcon>
                            )
                          ) : (
                            <DianaIcon
                              filename="icNoOrder_16_NoFill"
                              description="Icone de ordenação"
                              color="#3FA110"
                              onClick={() => requestSort(column.id, "ascending")}
                            ></DianaIcon>
                          )}
                        </>
                      )}
                    </span>
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            <>
              {currentData.map((row, index) => (
                <tr key={index}>
                  {row.columns.map(
                    (column, index) =>
                      columns[index].hidden != false && (
                        <td
                          scope="row"
                          key={index}
                          style={{
                            width: `${columns[index].width}`,
                            maxWidth: `${columns[index].width}`
                          }}
                          title={`${columns[index].type === "string" ? column.label : ""}`}
                        >
                          <div className="TableItem">
                            {columns[index].type === "string" && column.label}
                            {columns[index].type === "number" && column.label}
                            {columns[index].type === "media" &&
                              formatMedia(Number(column.label))}
                            {columns[index].type === "bytes" &&
                              formatBytes(Number(column.label))}
                            {columns[index].type === "date" &&
                              formatDate(column.label! as string)}
                            {columns[index].type === undefined && column.element}
                          </div>
                        </td>
                      )
                  )}
                </tr>
              ))}
            </>
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{ height: "48px" }}></tr>
          <tr>
            <td colSpan={3}>1 - 10 de {rows.length} itens</td>
            <td colSpan={columns.length}>
              <span style={{ display: "flex", justifyContent: "end" }}>
                <Pagination
                  numberOfPages={Math.ceil(rows.length / pageSize)}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                ></Pagination>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
