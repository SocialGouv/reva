import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Just, Nothing } from "purify-ts";

import { Certification, Experience, Goal } from "../interface";

const hasLocalCandidacy = async () => {
  const storageKeys = await SecureStoragePlugin.keys();

  const storageKey = Capacitor.isNativePlatform()
    ? "candidacy"
    : "cap_sec_candidacy";
  return storageKeys.value.includes(storageKey);
};

const updateCandidacy = async (payload: any) => {
  let candidacy = {} as any;

  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    candidacy = JSON.parse(candidacyStore.value);
  }

  await SecureStoragePlugin.set({
    key: "candidacy",
    value: JSON.stringify({
      ...candidacy,
      ...payload,
      candidacyCreatedAt: candidacy.candidacyCreatedAt || Date.now(),
    }),
  });

  return candidacy;
};

export const saveCertification = async (certification: Certification) => {
  return await updateCandidacy({
    certification: {
      id: certification?.id,
      label: certification?.label,
      codeRncp: certification?.codeRncp,
    },
  });
};

export const saveExperiences = async (experiences: Experience[]) => {
  await updateCandidacy({
    experiences: experiences.map((exp: Experience) => ({
      ...exp,
      startDate: exp.startDate.getTime(),
    })),
  });

  return Just({ experiences });
};

export const saveGoals = async (goals: Goal[]) => {
  await updateCandidacy({
    goals,
  });

  return Just({ goals });
};

export const getLocalCandidacy = async () => {
  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    const payload = JSON.parse(candidacyStore.value);

    return Just({
      ...payload,
      experiences: (payload.experiences || []).map((exp: Experience) => ({
        ...exp,
        startDate: new Date(exp.startDate),
      })),
      candidacyCreatedAt: new Date(payload.candidacyCreatedAt),
    });
  } else {
    return Nothing;
  }
};
