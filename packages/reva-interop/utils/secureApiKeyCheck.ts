import crypto from "crypto";

export const secureApiKeyCheck = (apiKey: string) => {
  if (!process.env.AUTH_API_KEY) {
    throw new Error("AUTH_API_KEY is not set");
  }
  const lengthsMatch = apiKey?.length === process.env.AUTH_API_KEY.length;
  const isEqual = lengthsMatch
    ? crypto.timingSafeEqual(
        Buffer.from(apiKey as string),
        Buffer.from(process.env.AUTH_API_KEY as string),
      )
    : !crypto.timingSafeEqual(
        Buffer.from(apiKey as string),
        Buffer.from(apiKey as string),
      );
  return isEqual;
};
