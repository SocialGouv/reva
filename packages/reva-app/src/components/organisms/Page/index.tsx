import { ReactNode } from "react";
import { Helmet } from "react-helmet";

interface PageConfig {
  children?: ReactNode;
  className?: string;
  direction: Direction;
  title: string;
}

export type Direction = "initial" | "previous" | "next";

export const Page = ({
  title,
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
      <Helmet>
        <title>{title} - Reva - l'expérimentation de la VAE</title>
      </Helmet>
      {children}
    </div>
  );
};
