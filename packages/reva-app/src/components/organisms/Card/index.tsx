import { CSSProperties, useState } from "react";
import { Button } from "../../atoms/Button";
import { TextResult } from "../../atoms/TextResult";
import certificateImg from "./certificate.png";

interface Card {
  key: string;
  description: string;
  label: string;
  size?: "small" | "medium" | "large";
  title: string;
}

/**
 * Primary UI component for user interaction
 */
export const Card = ({
  description,
  label,
  title,

  ...props
}: Card) => {
  const [size, setSize] = useState(props.size || "small");

  const cardSizeStyle: CSSProperties = {
    height: size === "small" ? "270px" : size === "medium" ? "553px" : "100vh",
  };

  const cardPositionStyle: CSSProperties =
    size == "large"
      ? {
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: 2,
        }
      : { position: "relative" };

  const backgroundStyle: CSSProperties = {
    top: size === "large" ? "auto" : "15px",
    bottom: size === "large" ? "145px" : "auto",
    width: size === "small" ? "174px" : size === "medium" ? "240px" : "176px",
  };

  return (
    <div
      className={`overflow-hidden flex flex-col mb-10 pt-4 px-6 shadow-2xl bg-slate-900 text-white ${
        size === "large" ? "" : "mt-6 rounded-2xl"
      }`}
      style={{ ...cardSizeStyle, ...cardPositionStyle }}
      onClick={() => setSize("large")}
      {...props}
    >
      <img
        className="absolute left-[-43px]"
        style={backgroundStyle}
        src={certificateImg}
      />
      {size === "large" ? (
        <div className="text-right">←</div>
      ) : (
        <div className="text-right font-bold grow">{label}</div>
      )}
      <TextResult title={title} color="light" />
      {size === "large" ? (
        <div className="-mt-4 mb-4 font-bold">{label}</div>
      ) : (
        <></>
      )}
      {size === "small" ? (
        <></>
      ) : (
        <p
          className={`text-slate-500 text-sm leading-relaxed mb-6 ${
            size === "large" ? "grow min-h-[380px]" : ""
          }`}
        >
          {description}
        </p>
      )}
      {size === "large" ? (
        <Button className="mb-6" label="Candidater" primary size="medium" />
      ) : (
        <></>
      )}
    </div>
  );
};
