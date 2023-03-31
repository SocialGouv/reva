import * as React from "react";

export const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h1 className="lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px]">
    {children}
  </h1>
);

export const SectionSubHeader = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <p className={`font-bold lg:text-2xl ${className}`}>{children}</p>;

export const SectionParagraph = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <p
    className={`leading-7 lg:text-lg lg:leading-10 xl:text-[22px] ${className}`}
  >
    {children}
  </p>
);

export const SubSectionHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <header>
    <h2 className="text-white text-2xl mt-3">{children}</h2>
  </header>
);

export const Hexagon = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 180 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M79.4033 3.11801C85.9606 -0.667827 94.0394 -0.667827 100.597 3.11801L168.604 42.382C175.161 46.1678 179.201 53.1643 179.201 60.736V139.264C179.201 146.836 175.161 153.832 168.604 157.618L100.597 196.882C94.0394 200.668 85.9606 200.668 79.4033 196.882L11.3961 157.618C4.83883 153.832 0.799383 146.836 0.799383 139.264V60.736C0.799383 53.1643 4.83883 46.1678 11.3961 42.382L79.4033 3.11801Z"
      fill="currentColor"
    />
  </svg>
);
