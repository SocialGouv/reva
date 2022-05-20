import { Transition, motion } from "framer-motion";

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
    x: direction === "previous" ? "100%" : -140,
  }),
};

const pageTransition: Transition = {
  ease: [0.58, 0, 0.17, 0.84],
  duration: 0.45,
};

export const Page = ({
  children,
  className,
  direction,
  ...props
}: PageConfig) => {
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
      {...props}
    >
      {children}
    </motion.div>
  );
};
