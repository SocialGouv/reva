import { useRouter } from "next/router";
import { SyntheticEvent, useCallback, useState } from "react";
import { Button } from "../components/button/Button";
import { useMainImportContext } from "../components/main-context/MainContext";

export default function Home() {
  const [revaIdentifier, setRevaIdentifier] = useState("");
  const { userInfos, updateUserInfos } = useMainImportContext();
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      updateUserInfos({ ...userInfos, revaIdentifier });
      router.push("/diagnosis/add-experience");
    },
    [revaIdentifier, router, updateUserInfos, userInfos]
  );

  return (
    <div className="h-full flex flex-col items-center py-12">
      <h1 className="text-lg font-semibold">Hello !</h1>
      <div className=" font-light">Veuillez entrer votre identifiant REVA</div>
      <form className="flex flex-col items-center mt-8 space-y-6 w-full px-12" onSubmit={handleSubmit}>
        <input
          className="flex items-center h-16 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg placeholder:text-gray-500 w-full px-4 focus:outline-none"
          placeholder="john.doe@gmail.com"
          onChange={(e) => setRevaIdentifier(e.target.value)}
        />
        <Button
              type="submit"
              label= "Commencer"
              size="large"
            />
      </form>
    </div>
  );
}
