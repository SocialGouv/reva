import { CSSProperties, useState } from "react";
import { Button } from "../../atoms/Button";
import { TextResult } from "../../atoms/TextResult";
import certificateImg from "./certificate.png";
import { motion, useMotionValue } from "framer-motion";

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
        }
      : { position: "relative" };

  const backgroundStyle: CSSProperties = {
    top: isLarge ? "auto" : "15px",
    bottom: isLarge ? "145px" : "auto",
    width: isSmall ? "174px" : isMedium ? "240px" : "176px",
  };

  const openSpring = {
    type: "spring",
    stiffness: 200,
    damping: 30,
    duration: 2,
  };
  const closeSpring = {
    type: "spring",
    stiffness: 300,
    damping: 35,
    duration: 2,
  };

  const fromStyle = {
    borderRadius: "24px",
  };

  const toStyle = {
    borderRadius: "0px",
  };

  const ease = { type: "ease", duration: 0.2 };
  return (
    <li key={key} className="mt-6 mb-10" style={{ height: smallHeight }}>
      <motion.div
        initial={isLarge ? fromStyle : toStyle}
        animate={isLarge ? toStyle : fromStyle}
        className={`overflow-hidden flex flex-col pt-4 px-6 shadow-2xl bg-slate-900 text-white ${
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
            layout
            transition={ease}
            className="text-right font-bold grow"
          >
            {label}
          </motion.div>
        )}{" "}
        <motion.div layout="position" transition={ease}>
          <TextResult title={title} color="light" />
        </motion.div>
        {isLarge ? (
          <motion.div layout="position" transition={ease}>
            <div className="-mt-4 mb-4 font-bold">{label}</div>
          </motion.div>
        ) : (
          <></>
        )}
        {isSmall ? (
          <></>
        ) : (
          <p
            className={`text-slate-500 text-sm leading-relaxed mb-6 ${
              isLarge ? "grow min-h-[380px]" : ""
            }`}
          >
            {description}
          </p>
        )}
        {
          <motion.div layout="position" transition={ease}>
            {isLarge ? (
              <Button
                className="mb-6"
                label="Candidater"
                primary
                size="medium"
              />
            ) : (
              <></>
            )}
          </motion.div>
        }
      </motion.div>
    </li>
  );
};
