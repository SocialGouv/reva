import { useState } from "react";
import { Button } from "../../atoms/Button";
import { TextResult } from "../../atoms/TextResult";
import certificateImg from "./certificate.png";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import {
  heightConfig,
  rounded2xl,
  roundedNone,
  transitionOut,
  transitionIn,
} from "./view";

interface Card {
  id: string;
  description: string;
  label: string;
  initialSize?: "small" | "medium" | "large";
  title: string;
}

export const Card = ({
  description,
  id,
  label,
  title,
  initialSize = "small",
  ...props
}: Card) => {
  const [size, setSize] = useState(initialSize);

  const isSmall = size === "small";
  const isMedium = size === "medium";
  const isFullscreen = size === "large";
  const isReduced = isSmall || isMedium;

  const zIndex = useMotionValue(isFullscreen ? 20 : 0);
  const transition = isReduced ? transitionOut : transitionIn;

  const descriptionParagraph = (
    <motion.div
      className={`w-full" ${
        isFullscreen ? "pr-16" : isMedium ? "mt-[250px]" : "mt-[156px]"
      }`}
      layout="position"
      transition={transition}
    >
      <div className="flex items-end h-20">
        <TextResult title={title} color="light" />
      </div>
      <div
        className={`transition-opacity mt-1 mb-4 font-bold ${
          isReduced && "opacity-0"
        }`}
      >
        {label}
      </div>
      <p className="overflow-auto text-slate-500 overflow-auto text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );

  const candidateButton = (
    <motion.div
      className="absolute bottom-0 inset-x-0 p-8"
      exit={{ bottom: "-100px" }}
      transition={transition}
      layout="position"
    >
      <Button label="Candidater" className="w-full" primary size="medium" />
    </motion.div>
  );

  return (
    <li
      style={{
        height:
          initialSize === "small" ? heightConfig.small : heightConfig.medium,
      }}
    >
      <motion.div
        initial={isFullscreen ? rounded2xl : false}
        animate={isFullscreen ? roundedNone : rounded2xl}
        className={`cursor-pointer overflow-hidden flex flex-col items-end pt-4 pl-6 pr-2 shadow-2xl bg-slate-900 text-white ${
          isFullscreen ? "rounded-none" : "rounded-2xl"
        }`}
        layout
        transition={transition}
        layoutDependency={size}
        onAnimationStart={() => isFullscreen && zIndex.set(20)}
        onAnimationComplete={() => isReduced && zIndex.set(0)}
        onClick={() => (isReduced ? setSize("large") : {})}
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
        <motion.img
          layout
          transition={transition}
          className="absolute left-[-43px]"
          style={{
            top: isFullscreen ? "auto" : "15px",
            bottom: isFullscreen ? "145px" : "auto",
            width: isSmall ? "150px" : isMedium ? "240px" : "174px",
          }}
          src={certificateImg}
        />
        {isFullscreen && (
          <motion.div transition={transition} layout="position">
            <button
              type="button"
              onClick={() => setSize(initialSize)}
              className="w-full text-right text-lg mt-8 p-4"
            >
              ←
            </button>
          </motion.div>
        )}

        <motion.div
          layout="position"
          transition={transition}
          className={`transition-opacity absolute top-4 right-4 text-right font-bold grow ${
            isFullscreen && "opacity-0"
          }`}
        >
          {label}
        </motion.div>

        {descriptionParagraph}
        <div
          className={`absolute bottom-0 ${
            isReduced ? "inset-x-[-32px]" : "inset-x-0"
          }`}
        >
          <AnimatePresence>{isFullscreen && candidateButton}</AnimatePresence>
        </div>
      </motion.div>
    </li>
  );
};
