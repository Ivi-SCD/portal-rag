import { DianaIcon } from "@diana-kit/react";
import "#/components/Pagination/index.scss";

interface Props {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  numberOfPages: number;
}

export const Pagination = ({ currentPage, setCurrentPage, numberOfPages }: Props) => {
  const generatePageNumbers = () => {
    const pageNumbers = [];
    if (numberOfPages <= 7) {
      for (let i = 1; i <= numberOfPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(numberOfPages);
      } else if (currentPage > numberOfPages - 4) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = numberOfPages - 4; i <= numberOfPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(numberOfPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <ol className="Pagination">
      <li title="voltar">
        <DianaIcon
          aria-label="voltar"
          filename={"icChevronLeft_16_NoFill"}
          className={`${currentPage - 1 === 0 && "disabled"}`}
          onClick={() => setCurrentPage(currentPage - 1)}
        ></DianaIcon>
      </li>
      {pageNumbers.map((page, index) =>
        typeof page === "number" ? (
          <li key={index} onClick={() => setCurrentPage(page)}>
            <div className={`Page ${currentPage === page ? "Selected" : ""}`}>{page}</div>
          </li>
        ) : (
          <li key={index}>
            <div className="Page">...</div>
          </li>
        )
      )}
      <li title="avançar">
        <DianaIcon
          aria-label="avançar"
          filename={"icChevronRight_16_NoFill"}
          className={`${currentPage + 1 > numberOfPages && "disabled"}`}
          onClick={() => setCurrentPage(currentPage + 1)}
        ></DianaIcon>
      </li>
    </ol>
  );
};
