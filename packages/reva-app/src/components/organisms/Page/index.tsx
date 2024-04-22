import { ReactNode } from "react";
import { Helmet } from "react-helmet";

interface PageConfig {
  children?: ReactNode;
  className?: string;
  title: string;
}

export const Page = ({ title, children, className, ...props }: PageConfig) => {
  return (
    <div
      className={`flex flex-col px-4 pt-10 pb-8 ${className || ""} `}
      {...props}
    >
      <Helmet>
        <title>{title} - France VAE</title>
      </Helmet>
      {children}
    </div>
  );
};
