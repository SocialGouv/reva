import { motion } from "framer-motion";
import React from "react";
import { useState } from "react";

import { Add } from "../../atoms/Icons";
import { TextResult } from "../../atoms/TextResult";
import { BackButton } from "../../molecules/BackButton";
import certificateImg from "./certificate.png";
import {
  SMALL_TITLE_LENGTH,
  heightConfig,
  transitionIn,
  transitionOut,
} from "./view";

export type CardSize = "reduced" | "open";

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
      onClose = () => {},
      onLearnMore = () => {},
      onOpen = () => {},
      title,
      initialSize = "reduced",
      ...props
    },
    ref
  ) => {
    const [size, setSize] = useState<CardSize>(initialSize);

    const isReduced = size === "reduced";
    const isFullscreen = size === "open";

    const transition = isReduced ? transitionOut : transitionIn;

    const fullScreenVariants = {
      open: { y: 0 },
      closed: { y: 80 },
    };

    // TODO: move this to an external component
    const fullscreenDetails = (
      <motion.div
        variants={fullScreenVariants}
        initial={initialSize === "open" || isReduced ? false : "closed"}
        animate={isReduced ? "closed" : "open"}
        transition={transition}
        style={{
          height: "calc(100vh - 120px)",
        }}
        className="overflow-x-hidden overflow-y-auto absolute inset-0 z-50"
      >
        <div className="absolute top-6 z-50 w-full">
          <BackButton
            color="light"
            onClick={() => {
              setSize("reduced");
              onClose();
            }}
          />
        </div>
        <div className={`w-full px-6 mt-28 mb-4`}>
          <TextResult size="large" title={title} color="light" />
          <div>
            <div className="mt-1 mb-4 font-bold text-white">{label}</div>
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
        </div>
        <img
          className="pointer-events-none"
          style={{
            marginLeft: "-70px",
            height: "174px",
            width: "174px",
          }}
          src={certificateImg}
        />
      </motion.div>
    );

    const reducedInfo = (
      <>
        <motion.div
          layout="position"
          className={`absolute top-5 right-6 text-right font-bold grow `}
        >
          {label}
          <div className="mt-4 rounded-full flex items-center justify-center h-[46px] w-[46px] bg-blue-500">
            <div className="w-[18px]">
              <Add />
            </div>
          </div>
        </motion.div>
        <motion.img
          layout
          className="absolute pointer-events-none"
          style={{
            left: "-43px",
            top: "12px",
            height: isReduced ? "104px" : "240px",
            width: isReduced ? "104px" : "240px",
          }}
          src={certificateImg}
        />
        <motion.div layout className={"flex items-end h-full p-5"}>
          <TextResult
            size="small"
            title={
              title.length > SMALL_TITLE_LENGTH
                ? `${title.substring(0, SMALL_TITLE_LENGTH)}...`
                : title
            }
            color="light"
          />
        </motion.div>
      </>
    );

    return (
      <li
        ref={ref}
        style={{
          height: heightConfig.small,
        }}
      >
        <motion.div
          className={`cursor-pointer overflow-hidden bg-slate-900 text-white ${
            isReduced ? "rounded-2xl" : "rounded-none"
          }`}
          layout
          transition={transition}
          layoutDependency={size}
          onClick={() => (isReduced ? (setSize("open"), onOpen()) : {})}
          whileTap={{ scale: isReduced ? 0.92 : 1 }}
          style={{
            zIndex: isReduced ? 0 : 20,
            height: isReduced ? heightConfig.small : heightConfig.large,
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
          {isReduced && reducedInfo}
        </motion.div>
        {!isReduced && fullscreenDetails}
      </li>
    );
  }
);
