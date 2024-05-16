interface Props {
  label?: string;
  codeRncp?: string;
  typeDiplomeLabel?: string;
}

export const CertificationCard = (props: Props): JSX.Element => {
  const { label, codeRncp, typeDiplomeLabel } = props;

  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <div className="flex flex-row items-center justify-between">
        <label className="text-gray-600 text-xs italic">
          {typeDiplomeLabel || ""}
        </label>
        <label className="text-gray-600 text-xs italic">{codeRncp || ""}</label>
      </div>
      <label className="text-lg font-bold">{label || ""}</label>
    </div>
  );
};
