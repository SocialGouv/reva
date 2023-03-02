interface PageConfig {
  children: JSX.Element | JSX.Element[];
  className: string;
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
    <div className={className} {...props}>
      {children}
    </div>
  );
};
