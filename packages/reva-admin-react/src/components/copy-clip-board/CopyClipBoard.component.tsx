import { useState } from "react";

import "./CopyClipBoard.css";

interface Props {
  onClick: (callback: (value: string) => void) => void;
  children?: React.ReactNode;
}

export const CopyClipBoard = (props: Props) => {
  const { onClick, children } = props;

  const [display, setDisplay] = useState(false);

  const toggle = () => {
    if (display) {
      return;
    }

    setDisplay(true);

    setTimeout(() => {
      setDisplay(false);
    }, 1000);
  };

  return (
    <div
      className="Container"
      onClick={() =>
        onClick((value: string) => {
          navigator.clipboard.writeText(value);

          toggle();
        })
      }
    >
      {children}
      <div
        className={`CopiedClipBoardTooltip ${display ? "enabled" : "disabled"}`}
      >
        Copié
      </div>
    </div>
  );
};
