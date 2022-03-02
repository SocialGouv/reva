import { TextResult } from "../TextResult";

interface BlockResult {
  label: string;
  title: string;
}

/**
 * Primary UI component for user interaction
 */
export const BlockResult = ({ label, title }: BlockResult) => {
  return (
    <div className="h-64 my-4 p-8 rounded-2xl bg-slate-900 text-white">
      <span className="font-bold">{label}</span>
      <TextResult title={title} color="light" />
    </div>
  );
};
