import CryptoJS from "crypto-js";
import jwt, { JwtPayload } from "jsonwebtoken";

import { logger } from "../logger/logger";

export const generateJwt = (data: unknown, expiresIn: number = 15 * 60) => {
  const dataStr = JSON.stringify(data);
  const cryptedData = CryptoJS.AES.encrypt(
    dataStr,
    process.env.DATA_ENCRYPT_PRIVATE_KEY!,
  );
  return jwt.sign(
    {
      data: cryptedData.toString(),
    },
    process.env.JWT_PRIVATE_KEY!,
    { expiresIn },
  );
};

export const getJWTContent = (token: string) => {
  try {
    const tokenData = jwt.verify(
      token,
      process.env.JWT_PRIVATE_KEY!,
    ) as JwtPayload;
    const dataBytes = CryptoJS.AES.decrypt(
      tokenData.data,
      process.env.DATA_ENCRYPT_PRIVATE_KEY!,
    );

    return JSON.parse(dataBytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    logger.error(e);
    throw new Error("Error while parsing JWT token");
  }
};
