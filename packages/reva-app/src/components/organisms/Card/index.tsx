import { CSSProperties, useState } from "react";
import { Button } from "../../atoms/Button";
import { TextResult } from "../../atoms/TextResult";
import certificateImg from "./certificate.png";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";

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
  key,
  label,
  title,

  ...props
}: Card) => {
  const [size, setSize] = useState(props.size || "small");

  const isSmall = size === "small";
  const isMedium = size === "medium";
  const isLarge = size === "large";

  const zIndex = useMotionValue(isLarge ? 20 : 0);

  const smallHeight = "270px";
  const cardSizeStyle: CSSProperties = {
    height: isSmall ? smallHeight : size === "medium" ? "553px" : "100vh",
  };

  const cardPositionStyle: CSSProperties =
    size == "large"
      ? {
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
        }
      : { position: "relative" };

  const backgroundStyle: CSSProperties = {
    top: isLarge ? "auto" : "15px",
    bottom: isLarge ? "145px" : "auto",
    width: isSmall ? "150px" : isMedium ? "240px" : "174px",
  };

  const openSpring = {
    type: "spring",
    stiffness: 200,
    damping: 30,
  };
  const closeSpring = {
    type: "spring",
    stiffness: 500,
    damping: 35,
  };

  const fromStyle = {
    borderRadius: "24px",
  };

  const toStyle = {
    borderRadius: "0px",
  };

  const ease = { type: "ease", duration: 0.8 };

  const descriptionHeight = 200;

  const descriptionParagraph = (
    <motion.div
      className={`w-full" ${isLarge ? "pr-10" : "mt-[112px]"}`}
      layout="position"
      transition={ease}
    >
      <div className="flex items-end h-24">
        <TextResult title={title} color="light" />
      </div>
      <div className={`mt-1 mb-4 font-bold ${isSmall && "opacity-0"}`}>
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
      transition={ease}
      layout="position"
    >
      <Button label="Candidater" className="w-full" primary size="medium" />
    </motion.div>
  );

  return (
    <li key={key} className="mt-6 mb-10" style={{ height: smallHeight }}>
      <motion.div
        initial={isLarge ? fromStyle : toStyle}
        animate={isLarge ? toStyle : fromStyle}
        className={`overflow-hidden flex flex-col pt-4 pl-6 pr-2 shadow-2xl bg-slate-900 text-white ${
          isLarge ? "rounded-none" : "rounded-2xl"
        }`}
        layout
        transition={ease}
        layoutDependency={size}
        onAnimationStart={() => (isLarge ? zIndex.set(20) : {})}
        onAnimationComplete={() => (isSmall ? zIndex.set(0) : {})}
        onClick={() => (isSmall ? setSize("large") : {})}
        style={{ zIndex, ...cardSizeStyle, ...cardPositionStyle }}
        {...props}
      >
        <motion.img
          layout
          transition={ease}
          className="absolute left-[-43px]"
          style={backgroundStyle}
          src={certificateImg}
        />
        {isLarge ? (
          <motion.div transition={ease} layout="position">
            <button
              type="button"
              onClick={() => setSize("small")}
              className="w-full text-right text-lg mt-8 p-2"
            >
              ←
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout="position"
            transition={ease}
            className="text-right font-bold grow"
          >
            {label}
          </motion.div>
        )}{" "}
        {descriptionParagraph}
        <div
          className={`absolute bottom-0 ${
            isSmall ? "inset-x-[-32px]" : "inset-x-0"
          }`}
        >
          <AnimatePresence>{isLarge && candidateButton}</AnimatePresence>
        </div>
      </motion.div>
    </li>
  );
};

/**
 *      <motion.div
            className={`${isLarge ? "mb-8" : "-mb-12"}`}
            layout="position"
            transition={ease}
          >
          </motion.div>
*/
