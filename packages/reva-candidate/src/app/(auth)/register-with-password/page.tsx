"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { RegisterWithPasswordForm } from "../register/_components/RegisterWithPasswordForm";

export default function RegisterWithPassword() {
  const router = useRouter();
  const { isFeatureActive, status } = useAnonymousFeatureFlipping();
  const isRegisterWithPasswordEnabled = isFeatureActive(
    "ENABLE_REGISTER_WITH_PASSWORD",
  );

  useEffect(() => {
    if (status === "INITIALIZED" && !isRegisterWithPasswordEnabled) {
      router.replace("/register");
    }
  }, [isRegisterWithPasswordEnabled, router, status]);

  if (status === "LOADING" || !isRegisterWithPasswordEnabled) {
    return <LoaderWithLayout />;
  }

  return (
    <div className="flex-1 pb-6">
      <div className="flex justify-center">
        <div className="w-full lg:w-[588px] bg-white shadow-lifted p-6">
          <h1 className="mb-6 text-center">Création de compte</h1>
          <RegisterWithPasswordForm />
        </div>
      </div>
    </div>
  );
}
