import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export const NoResults = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-80 h-full flex flex-col items-center">
      <div className="my-12">{PICTOGRAMS.searchLG}</div>
      <h3 className="text-center text-balance">{title}</h3>
      <div className="max-w-lg [&_p]:text-lg text-center text-balance leading-relaxed">
        {children}
      </div>
    </div>
  );
};
