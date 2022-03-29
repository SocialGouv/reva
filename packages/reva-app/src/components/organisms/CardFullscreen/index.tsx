import { AnimatePresence, motion } from "framer-motion";
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
        layoutId={`decorative-img-${id}`}
        transition={transition}
        className="pointer-events-none"
        style={{
          position: "relative",
          left: "-70px",
          height: "174px",
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
        <div className={`w-full px-6 ${"mb-4"}`}>
          <div>
            <TextResult size="large" title={title} color="light" />
          </div>
          <div className={`transition-opacity`}>
            <div className="mt-1 mb-4 font-bold">{label}</div>
            <p className="overflow-auto text-slate-400 text-base leading-normal transition-opacity">
              {summary}
            </p>
          </div>
          <a
            className="block text-blue-500 py-4 underline"
            onClick={onLearnMore}
          >
            Lire tous les détails
          </a>
        </div>
        {decorativeImg}
      </div>
    );

    return (
      <>
        <motion.div
          initial={roundedNone}
          animate={roundedNone}
          className={`will-change-transform absolute inset-0 z-20 screen-full cursor-pointer overflow-hidden bg-slate-900 text-white rounded-none`}
          layoutId={`card-${id}`}
          id={id}
          transition={transition}
          {...props}
        >
          <BackButton color="light" onClick={onClose} />
        </motion.div>
        {/** <div className="absolute inset-0 z-30">
          <BackButton color="light" onClick={onClose} />
          {summaryParagraph}
        </div>
      */}
      </>
    );
  }
);
