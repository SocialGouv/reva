import { motion, useMotionValue } from "framer-motion";
import React from "react";
import { useState } from "react";

import { Add } from "../../atoms/Icons";
import { TextResult } from "../../atoms/TextResult";
import { BackButton } from "../../molecules/BackButton";
import certificateImg from "./certificate.png";
import {
  SMALL_TITLE_LENGTH,
  heightConfig,
  rounded2xl,
  roundedNone,
  transitionIn,
  transitionOut,
} from "./view";

export type CardSize = "small" | "medium" | "large";

interface Card {
  id: string;
  summary: string;
  label: string;
  isOpen?: boolean;
  onClose?: () => void;
  onLearnMore?: () => void;
  onOpen?: () => void;
  initialSize?: CardSize;
  title: string;
}

export const Card = React.forwardRef<HTMLLIElement, Card>(
  (
    {
      summary,
      id,
      label,
      isOpen = false,
      onClose = () => {},
      onLearnMore = () => {},
      onOpen = () => {},

      title,
      initialSize = "small",
      ...props
    },
    ref
  ) => {
    const [size, setSize] = useState(isOpen ? "large" : initialSize);

    const isSmall = size === "small";
    const isMedium = size === "medium";
    const isFullscreen = size === "large";
    const isReduced = isSmall || isMedium;

    const zIndex = useMotionValue(isFullscreen ? 20 : 0);
    const transition = isReduced ? transitionOut : transitionIn;

    const decorativeImg = (
      <motion.img
        layout
        transition={transition}
        className="pointer-events-none"
        style={
          isFullscreen
            ? {
                position: "relative",
                marginLeft: "-70px",
                width: "174px",
              }
            : {
                position: "absolute",
                left: "-43px",
                top: "12px",
                width: isSmall ? "104px" : "240px",
              }
        }
        src={certificateImg}
      />
    );

    const summaryParagraph = (
      <div
        style={
          isFullscreen
            ? {
                overflowX: "hidden",
                overflowY: "auto",
                height: "calc(100vh - 216px)",
              }
            : {}
        }
      >
        <motion.div
          className={`w-full px-6 ${
            isFullscreen ? "mb-4" : isMedium ? "mt-[250px]" : "mt-[168px]"
          }`}
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
          <div className={`transition-opacity ${isReduced && "opacity-0"}`}>
            <div className="mt-1 mb-4 font-bold">{label}</div>
            <p className="overflow-auto text-slate-400 text-base leading-normal transition-opacity">
              {summary}
            </p>{" "}
          </div>
          <a
            className="block text-blue-500 py-4 underline"
            onClick={onLearnMore}
          >
            Lire tous les détails
          </a>
        </motion.div>
        {decorativeImg}
      </div>
    );

    return (
      <li
        ref={ref}
        style={{
          height:
            initialSize === "small" ? heightConfig.small : heightConfig.medium,
        }}
      >
        <motion.div
          initial={isFullscreen ? rounded2xl : false}
          animate={isFullscreen ? roundedNone : rounded2xl}
          className={`cursor-pointer overflow-hidden shadow-2xl bg-slate-900 text-white ${
            isFullscreen ? "rounded-none" : "rounded-3xl"
          }`}
          layout
          transition={transition}
          layoutDependency={size}
          onAnimationStart={() => isFullscreen && zIndex.set(20)}
          onAnimationComplete={() => isReduced && zIndex.set(0)}
          onClick={() => (isReduced ? (setSize("large"), onOpen()) : {})}
          whileTap={{ scale: isReduced ? 0.92 : 1 }}
          style={{
            zIndex,
            height: heightConfig[size],
            ...(isFullscreen
              ? {
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                }
              : { position: "relative" }),
          }}
          {...props}
        >
          {isFullscreen && (
            <motion.div
              className="mt-6"
              transition={transition}
              layout="position"
            >
              <BackButton
                color="light"
                onClick={() => {
                  setSize("small");
                  onClose();
                }}
              />
            </motion.div>
          )}

          <motion.div
            layout="position"
            transition={transition}
            className={`transition-opacity absolute top-5 right-6 text-right font-bold grow ${
              isFullscreen && "pointer-events-none opacity-0"
            }`}
          >
            {label}
            <div className="mt-4 rounded-full flex items-center justify-center h-[46px] w-[46px] bg-blue-500">
              <div className="w-[18px]">
                <Add />
              </div>
            </div>
          </motion.div>

          {summaryParagraph}
        </motion.div>
      </li>
    );
  }
);
