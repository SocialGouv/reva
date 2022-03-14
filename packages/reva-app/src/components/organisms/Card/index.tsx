import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

import { Button } from "../../atoms/Button";
import { Add, Back } from "../../atoms/Icons";
import { TextResult } from "../../atoms/TextResult";
import certificateImg from "./certificate.png";
import {
  heightConfig,
  rounded2xl,
  roundedNone,
  transitionIn,
  transitionOut,
} from "./view";

export type CardSize = "small" | "medium" | "large";

interface Card {
  id: string;
  description: string;
  label: string;
  initialSize?: CardSize;
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

  useEffect(() => {
    async function setStatusBarVisibility() {
      if (isFullscreen) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
      }
    }
    Capacitor.isNativePlatform() && setStatusBarVisibility();
  }, [isFullscreen]);

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
              width: isSmall ? "106px" : "240px",
            }
      }
      src={certificateImg}
    />
  );

  const descriptionParagraph = (
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
          isFullscreen ? "mb-4 pr-20" : isMedium ? "mt-[250px]" : "mt-[168px]"
        }`}
        layout="position"
        transition={transition}
      >
        <div className={isSmall ? "flex items-end h-20" : ""}>
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
      {decorativeImg}
    </div>
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
        className={`cursor-pointer overflow-hidden shadow-2xl bg-slate-900 text-white ${
          isFullscreen ? "rounded-none" : "rounded-3xl"
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
        {isFullscreen && (
          <motion.div transition={transition} layout="position">
            <button
              type="button"
              onClick={() => setSize(initialSize)}
              className="flex items-center justify-end w-full pt-6 px-8 h-24"
            >
              <div className="w-[22px]">
                <Back />
              </div>
            </button>
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
