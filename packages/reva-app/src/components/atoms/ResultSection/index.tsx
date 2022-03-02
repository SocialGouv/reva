interface ResultSectionProps<Data> {
  /**
   * Section name
   */
  title: string;
  /**
   * Custom class
   */
  className?: string;
  children: JSX.Element[];
}

export const ResultSection = ({
  children,
  className = "",
  title,
}: ResultSectionProps<any>) => {
  return (
    <section className={`my-4 py-4 ${className}`}>
      <div className="text-lg text-slate-600">{title}</div>
      {children}
    </section>
  );
};
