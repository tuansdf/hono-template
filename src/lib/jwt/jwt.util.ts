import { decode, sign, verify } from "hono/jwt";
import { ENV_JWT_SECRET } from "~/constants/env.constant";
import { JwtTokenPayload } from "~/lib/jwt/jwt.type";

export class JwtUtils {
  static async decode(toBeDecoded: string) {
    return decode(toBeDecoded);
  }

  static async sign(payload: JwtTokenPayload): Promise<string> {
    return sign(payload, ENV_JWT_SECRET, "HS256");
  }

  static async verify(toBeVerified: string): Promise<JwtTokenPayload> {
    return verify(toBeVerified, ENV_JWT_SECRET, "HS256");
  }
}
