import { motion } from "framer-motion";
import React from "react";

import { Add } from "../../atoms/Icons";
import { TextResult } from "../../atoms/TextResult";
import { BackButton } from "../../molecules/BackButton";
import certificateImg from "../Card/certificate.png";
import {
  heightConfig,
  rounded2xl,
  roundedNone,
  transitionIn,
} from "../Card/view";

interface CardFullscreenProps {
  id: string;
  summary: string;
  label: string;
  isOpen?: boolean;
  onClose?: () => void;
  onLearnMore?: () => void;
  onOpen?: () => void;
  title: string;
}

export const CardFullscreen = React.forwardRef<
  HTMLLIElement,
  CardFullscreenProps
>(
  (
    {
      summary,
      id,
      label,

      onClose = () => {},
      onLearnMore = () => {},

      title,
      ...props
    },
    ref
  ) => {
    const transition = transitionIn;

    const decorativeImg = (
      <motion.img
        layout
        transition={transition}
        className="pointer-events-none"
        style={{
          position: "relative",
          marginLeft: "-70px",
          width: "174px",
        }}
        src={certificateImg}
      />
    );

    const summaryParagraph = (
      <div
        style={{
          overflowX: "hidden",
          overflowY: "auto",
          height: "calc(100vh - 216px)",
        }}
      >
        <motion.div
          className={`w-full px-6 ${"mb-4"}`}
          layout="position"
          transition={transition}
        >
          <div>
            <TextResult size={"small"} title={title} color="light" />
          </div>
          <div className={`transition-opacity`}>
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
      <motion.div
        initial={rounded2xl}
        animate={roundedNone}
        className={`cursor-pointer overflow-hidden shadow-2xl bg-slate-900 text-white ${"rounded-none"}`}
        layout
        transition={transition}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          zIndex: "20",
          height: "100vh",
        }}
        {...props}
      >
        {
          <motion.div
            className="mt-6"
            transition={transition}
            layout="position"
          >
            <BackButton color="light" onClick={onClose} />
          </motion.div>
        }

        <motion.div
          layout="position"
          transition={transition}
          className={`transition-opacity absolute top-5 right-6 text-right font-bold grow 
             "pointer-events-none opacity-0
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
    );
  }
);
