import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { Add } from "../../atoms/Icons";
import { TextResult } from "../../atoms/TextResult";
import certificateImg from "./certificate.png";
import {
  SMALL_TITLE_LENGTH,
  heightConfig,
  rounded2xl,
  roundedNone,
  transitionOut,
} from "./view";

export type CardSize = "small" | "medium" | "large";

interface Card {
  id: string;
  summary: string;
  label: string;
  isOpen: boolean;
  onOpen?: () => void;

  size?: CardSize;
  title: string;
}

export const Card = React.forwardRef<HTMLLIElement, Card>(
  (
    {
      summary,
      id,
      isOpen,
      label,
      onOpen = () => {},
      title,
      size = "small",
      ...props
    },
    ref
  ) => {
    const isSmall = size === "small";
    const isMedium = size === "medium";

    const transition = transitionOut;

    const decorativeImg = (
      <motion.img
        layout
        layoutId={`decorative-img-${id}`}
        transition={transition}
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "-43px",
          top: "12px",
          height: isSmall ? "104px" : "240px",
          width: isSmall ? "104px" : "240px",
        }}
        src={certificateImg}
      />
    );

    const summaryParagraph = (
      <div>
        <motion.div
          className={`w-full px-6 ${isMedium ? "mt-[250px]" : "mt-[168px]"}`}
          layout="position"
          transition={transition}
        >
          <div className={isSmall ? "flex items-end h-20" : ""}>
            <TextResult
              size={isSmall ? "small" : "large"}
              title={
                isSmall && title.length > SMALL_TITLE_LENGTH
                  ? `${title.substring(0, SMALL_TITLE_LENGTH)}...`
                  : title
              }
              color="light"
            />
          </div>
        </motion.div>
        {decorativeImg}
      </div>
    );

    return (
      <li
        ref={ref}
        style={{
          height: size === "small" ? heightConfig.small : heightConfig.medium,
        }}
      >
        <div className="shadow-xl rounded-2xl">
          {isOpen ? (
            <div
              className={`relative cursor-pointer bg-slate-900 text-white rounded-none`}
              id={id}
              //layoutDependency={size}
              onClick={onOpen}
              style={{
                height: heightConfig[size],
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto",
              }}
              {...props}
            ></div>
          ) : (
            <motion.div
              initial={roundedNone}
              animate={roundedNone}
              className={`relative cursor-pointer bg-slate-900 text-white rounded-none`}
              layoutId={`card-${id}`}
              id={id}
              transition={transition}
              //layoutDependency={size}
              onClick={onOpen}
              style={{
                height: heightConfig[size],
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto",
              }}
              {...props}
            ></motion.div>
          )}
        </div>
      </li>
    );
  }
);
