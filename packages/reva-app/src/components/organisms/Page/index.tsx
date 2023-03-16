import { ReactNode } from "react";

interface PageConfig {
  children?: ReactNode;
  className?: string;
  direction: Direction;
}

export type Direction = "initial" | "previous" | "next";

export const Page = ({
  children,
  className,
  direction,
  ...props
}: PageConfig) => {
  return (
    <div
      className={`flex flex-col px-4 pt-5 pb-32 lg:pl-16 lg:pt-20 max-w-4xl ${
        className || ""
      } `}
      {...props}
    >
      {children}
    </div>
  );
};
