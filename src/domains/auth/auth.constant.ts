import {
  ENV_JWT_ACCESS_LIFETIME,
  ENV_JWT_REFRESH_LIFETIME,
  ENV_JWT_RESET_PASSWORD_LIFETIME,
} from "~/constants/env.constant.js";
import { JwtTokenType } from "~/domains/auth/auth.type.js";

export const JWT_TYPE = {
  ACCESS: 1,
  REFRESH: 2,
  RESET_PASSWORD: 3,
} as const;

export const JWT_TYPE_LIFETIME: Readonly<Record<JwtTokenType, number>> = {
  [JWT_TYPE.ACCESS]: ENV_JWT_ACCESS_LIFETIME,
  [JWT_TYPE.REFRESH]: ENV_JWT_REFRESH_LIFETIME,
  [JWT_TYPE.RESET_PASSWORD]: ENV_JWT_RESET_PASSWORD_LIFETIME,
};
