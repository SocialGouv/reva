import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Just, Nothing } from "purify-ts";

import { Certification, Experience, Goal } from "../interface";

const readCandidacy = () => {};

const hasLocalCandidacy = async () => {
  const storageKeys = await SecureStoragePlugin.keys();

  const storageKey = Capacitor.isNativePlatform()
    ? "candidacy"
    : "cap_sec_candidacy";
  return storageKeys.value.includes(storageKey);
};

export const saveCertification = async (certification: Certification) => {
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

export const saveExperiences = async (experiences: Experience[]) => {
  let candidacy = {} as any;

  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    candidacy = JSON.parse(candidacyStore.value);
  }

  const payload = {
    ...candidacy,
    experiences: experiences.map((exp: any) => ({
      ...exp,
      startDate: exp.startDate.getTime(),
    })),
  };

  await SecureStoragePlugin.set({
    key: "candidacy",
    value: JSON.stringify(payload),
  });

  return { experiences };
};

export const saveGoals = async (goals: Goal[]) => {
  let candidacy = {} as any;

  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    candidacy = JSON.parse(candidacyStore.value);
  }

  const payload = {
    ...candidacy,
    goals,
  };

  await SecureStoragePlugin.set({
    key: "candidacy",
    value: JSON.stringify(payload),
  });

  return { goals };
};

export const getLocalCandidacy = async () => {
  if (await hasLocalCandidacy()) {
    const candidacyStore = await SecureStoragePlugin.get({
      key: "candidacy",
    });

    const payload = JSON.parse(candidacyStore.value);

    console.log(payload);
    return Just({
      ...payload,
      experiences: payload.experiences.map((exp: any) => ({
        ...exp,
        startDate: new Date(exp.startDate),
      })),
      candidacyCreatedAt: new Date(payload.candidacyCreatedAt),
    });
  } else {
    return Nothing;
  }
};
