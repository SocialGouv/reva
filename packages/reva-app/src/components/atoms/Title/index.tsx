interface TitleProps {
  label: string;
}

export const Title = ({ label = "" }: TitleProps) => (
  <h3 className="mt-4 text-xl text-slate-800 font-bold">{label}</h3>
);
