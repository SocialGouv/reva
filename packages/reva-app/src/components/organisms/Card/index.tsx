import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useState } from "react";

import { Add } from "../../atoms/Icons";
import { TextResult } from "../../atoms/TextResult";
import { BackButton } from "../../molecules/BackButton";
import certificationImg from "./certification.png";
import { transitionIn, transitionOut } from "./view";

export type CardSize = "reduced" | "open";

export const STATUS_AVAILABLE = "AVAILABLE";
export const STATUS_SOON = "SOON";

export type CardStatus = typeof STATUS_AVAILABLE | typeof STATUS_SOON;

interface Card {
  id: string;
  summary: string;
  label: string;
  status: CardStatus;
  isSelectable: boolean;
  onClose?: () => void;
  onLearnMore?: () => void;
  onOpen?: () => void;
  initialSize?: CardSize;
  title: string;
}

const CertificationStatus = (props: { status: CardStatus }) => {
  return (
    <div className="flex space-x-2 items-center text-xs uppercase font-medium">
      <div
        className={
          `h-2 w-2 rounded-full ` +
          (props.status == STATUS_AVAILABLE ? "bg-green-500" : "bg-red-500")
        }
      ></div>
      <div
        className={
          props.status == STATUS_AVAILABLE ? "text-white" : "text-gray-400"
        }
      >
        {props.status == STATUS_AVAILABLE ? "Disponible" : "Bientôt"}
      </div>
    </div>
  );
};

export const Card = React.forwardRef<HTMLLIElement, Card>(
  (
    {
      summary,
      id,
      isSelectable,
      label,
      onClose = () => {},
      onLearnMore = () => {},
      onOpen = () => {},
      title,
      status,
      initialSize = "reduced",
      ...props
    },
    ref
  ) => {
    const [size, setSize] = useState<CardSize>(initialSize);

    const isReduced = size === "reduced";

    const transition = isReduced ? transitionOut : transitionIn;

    const fullScreenVariants = {
      open: { y: 0, opacity: 1 },
      closed: { y: 50, opacity: 1 },
      exit: {
        scale: [1, 0.94],
        y: [0, 50],
        transition: { duration: 0.03 },
      },
    };

    // TODO: move this to an external component
    const fullscreenDetails = (
      <motion.div
        variants={fullScreenVariants}
        initial={initialSize === "open" || isReduced ? false : "closed"}
        animate={isReduced ? "closed" : "open"}
        exit="exit"
        transition={transition}
        className="overflow-x-hidden overflow-y-auto absolute inset-0 z-50 bg-slate-900"
      >
        <div
          style={{
            zIndex: 20,
            height: "calc(100vh - 116px)",
          }}
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
              data-test="certification-learn-more"
              className="block text-blue-500 py-4 underline"
              onClick={onLearnMore}
            >
              Lire tous les détails
            </a>
          </div>
          <img
            className="pointer-events-none"
            alt=""
            role="presentation"
            style={{
              marginLeft: "-70px",
              height: "174px",
              width: "174px",
            }}
            src={certificationImg}
          />
        </div>
      </motion.div>
    );

    const reducedInfo = (
      <>
        <motion.div
          layout="position"
          aria-label={title}
          className={`absolute top-5 right-6 text-right font-bold grow ${
            true ? "" : "pointer-events-none opacity-0"
          }`}
        >
          {label}
          <div
            aria-hidden="true"
            className="mt-4 rounded-full flex items-center justify-center h-[46px] w-[46px] bg-blue-500"
          >
            <div className="w-[18px]">
              <Add />
            </div>
          </div>
        </motion.div>
        <motion.img
          layout
          className="absolute pointer-events-none"
          alt=""
          role="presentation"
          style={{
            left: "-43px",
            top: "12px",
            height: "104px",
            width: "104px",
          }}
          src={certificationImg}
        />
        <motion.div layout className={"flex items-end h-full p-5"}>
          <div className="mt-[102px] flex flex-col space-y-4">
            <TextResult size="small" title={title} color="light" />
            <CertificationStatus status={status} />
          </div>
        </motion.div>
      </>
    );

    return (
      <li ref={ref}>
        <motion.button
          className="relative block text-left w-full cursor-pointer overflow-hidden bg-slate-900 text-white rounded-2xl"
          layout
          transition={transition}
          layoutDependency={size}
          data-test={`certification-select-${id}`}
          tabIndex={isSelectable ? 0 : -1}
          onClick={() => (isReduced ? (setSize("open"), onOpen()) : {})}
          whileTap={{ scale: isReduced ? 0.96 : 1 }}
          {...props}
        >
          {reducedInfo}
        </motion.button>
        <AnimatePresence>{!isReduced && fullscreenDetails}</AnimatePresence>
      </li>
    );
  }
);
