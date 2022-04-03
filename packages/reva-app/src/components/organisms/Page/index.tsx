import { motion } from "framer-motion";

interface PageConfig {
  children: JSX.Element | JSX.Element[];
  className: string;
  direction: Direction;
}

export type Direction = "previous" | "next";

const pageVariants = {
  enter: (direction: Direction) => ({
    x: direction === "previous" ? -100 : "100%",
  }),
  visible: { x: 0 },
  exit: (direction: Direction) => ({
    x: direction === "previous" ? "100%" : -100,
  }),
};

const pageTransition = { ease: "circOut", duration: 0.35 };

export const Page = ({ children, className, direction }: PageConfig) => {
  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={pageTransition}
      layoutScroll
      className={`will-change-transform absolute inset-0 ${className}`}
    >
      {children}
    </motion.div>
  );
};
