import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Just, Nothing } from "purify-ts";

const hasLocalCandidacy = async () => {
  const storageKeys = await SecureStoragePlugin.keys();

  const storageKey = Capacitor.isNativePlatform()
    ? "candidacy"
    : "cap_sec_candidacy";
  return storageKeys.value.includes(storageKey);
};

export const saveLocalCandidacy = async (certification: any) => {
  let candidacy = {} as any;

  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    candidacy = JSON.parse(candidacyStore.value);
  }

  const payload = {
    ...candidacy,
    candidacyCreatedAt: candidacy.candidacyCreatedAt || Date.now(),
    certification: {
      id: certification?.id,
      label: certification?.label,
      codeRncp: certification?.codeRncp,
    },
  };

  await SecureStoragePlugin.set({
    key: "candidacy",
    value: JSON.stringify(payload),
  });

  return payload;
};

export const getLocalCandidacy = async () => {
  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    const payload = JSON.parse(candidacyStore.value);

    return Just({
      ...payload,
      candidacyCreatedAt: payload.candidacyCreatedAt,
    });
  } else {
    return Nothing;
  }
};
