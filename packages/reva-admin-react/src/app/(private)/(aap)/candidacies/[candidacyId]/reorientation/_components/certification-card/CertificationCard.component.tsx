interface Props {
  label?: string;
  codeRncp?: string;
  typeDiplome?: string | null;
}

export const CertificationCard = (props: Props) => {
  const { label, codeRncp, typeDiplome } = props;

  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <div className="flex flex-row items-center justify-between">
        <label className="text-gray-600 text-xs italic">
          {typeDiplome || ""}
        </label>
        <label className="text-gray-600 text-xs italic">{codeRncp || ""}</label>
      </div>
      <label className="text-lg font-bold">{label || ""}</label>
    </div>
  );
};
