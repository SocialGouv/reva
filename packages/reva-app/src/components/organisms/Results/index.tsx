interface ResultsProps {
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

export const Results = ({ children, className = "", title }: ResultsProps) => {
  return (
    <section className={`mb-2 py-4 ${className}`}>
      <div className="-mb-1 text-lg text-slate-600">{title}</div>
      <ul className="list-none">{children}</ul>
    </section>
  );
};
