// import { DianaIcon } from "@diana-kit/react";
import { useState } from "react";
import "./index.scss";

type Props = {
  updateRatingList: (docName: string, rating: number, dominio: string) => void;
  docName: string;
  dominio: string;
};

export const Rating = ({ updateRatingList, docName, dominio }: Props) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState<number>(0);

  const handleClick = (index: number) => {
    updateRatingList(docName, index, dominio);
    setRating(index);
  };

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="RatingBox">
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          className={`star ${index < rating ? "selected" : ""} ${index < hoverRating ? "hover" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          onClick={() => handleClick(index + 1)}
          onMouseEnter={() => handleMouseEnter(index + 1)}
          onMouseLeave={handleMouseLeave}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M32.5151 1.53937C32.4153 1.2662 32.172 1 31.8033 1C31.432 1 31.1879 1.26998 31.0894 1.54516L22.8328 21.4759L1.76675 23.8193C1.44929 23.831 1.16277 24.0101 1.04818 24.3174C0.934719 24.6217 1.02976 24.9469 1.24832 25.1667L1.25335 25.1718L17.0209 40.1496L12.6313 62.1269V62.1763C12.6313 62.5142 12.8609 62.7487 13.0376 62.8598C13.2206 62.9748 13.5364 63.0773 13.8486 62.9203L13.8682 62.9104L32.0533 51.6623L50.3739 62.6794C50.6403 62.9016 51.0035 62.9116 51.272 62.7187C51.5439 62.5233 51.6454 62.1799 51.5516 61.8546L47.0794 40.0484L62.7433 25.0765L62.7524 25.0676C62.971 24.8478 63.066 24.5226 62.9526 24.2183C62.8378 23.9106 62.5507 23.7314 62.2327 23.7201L41.2591 21.4739L32.5151 1.53937Z"
          ></path>
        </svg>
      ))}
    </div>
  );
};
