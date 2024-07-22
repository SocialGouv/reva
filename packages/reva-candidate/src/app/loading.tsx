import { Loader } from "@/components/legacy/atoms/Icons";

export default function Loading() {
  return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12" >
          <p>from server</p><Loader /></div>
        
      </div>
  );
}
