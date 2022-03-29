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

  onOpen?: () => void;
  size?: CardSize;
  title: string;
}

export const Card = React.forwardRef<HTMLLIElement, Card>(
  (
    { summary, id, label, onOpen = () => {}, title, size = "small", ...props },
    ref
  ) => {
    const isSmall = size === "small";
    const isMedium = size === "medium";

    const transition = transitionOut;

    const decorativeImg = (
      <motion.img
        layout
        transition={transition}
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "-43px",
          top: "12px",
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
        <motion.div
          initial={false}
          animate={rounded2xl}
          className={`cursor-pointer overflow-hidden shadow-2xl bg-slate-900 text-white ${"rounded-3xl"}`}
          layout
          transition={transition}
          layoutDependency={size}
          onClick={onOpen}
          whileTap={{ scale: 0.92 }}
          style={{
            height: heightConfig[size],
            position: "relative",
          }}
          {...props}
        >
          <motion.div
            layout="position"
            transition={transition}
            className={`transition-opacity absolute top-5 right-6 text-right font-bold grow`}
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
