import { LoginRequestDTO, RegisterRequestDTO } from "~/domains/auth/auth.type.js";
import { AuthUtils } from "~/domains/auth/auth.util.js";
import { PermissionRepository } from "~/domains/auth/permission.repository.js";
import { UserRepository } from "~/domains/user/user.repository.js";
import { User } from "~/domains/user/user.type.js";
import { CustomException } from "~/exceptions/custom-exception.js";
import { TFn } from "~/i18n/i18n.type.js";
import { HashUtils } from "~/lib/hash/hash.util.js";

export class AuthService {
  static async login(requestDTO: LoginRequestDTO, t: TFn) {
    const user = await UserRepository.findTopByUsername(requestDTO.username);
    if (!user) {
      throw new CustomException(t("user.error.not_found"), 404);
    }
    const isPasswordMatch = await HashUtils.verify(user.password || "", requestDTO.password);
    if (!isPasswordMatch) {
      throw new CustomException(t("auth.error.unauthorized"), 401);
    }
    const permissions = await PermissionRepository.findAllByUserId(user.id);
    const result: User = { ...user, permissions };
    const token = await AuthUtils.createAuthToken(result);
    return { ...result, token };
  }

  static async register(requestDTO: RegisterRequestDTO, t: TFn) {
    const existUserWithUsername = await UserRepository.existByUsername(requestDTO.username);
    if (existUserWithUsername) {
      throw new CustomException(t("user.error.duplicated_username"), 404);
    }
    const existUserWithEmail = await UserRepository.existByEmail(requestDTO.email);
    if (existUserWithEmail) {
      throw new CustomException(t("user.error.duplicated_email"), 404);
    }
    requestDTO.password = await HashUtils.hash(requestDTO.password);
    const saved = await UserRepository.save(requestDTO);
    const permissions = await PermissionRepository.findAllByUserId(saved.id);
    const result: User = { ...saved, permissions };
    const token = await AuthUtils.createAuthToken(result);
    return { ...result, token };
  }
}
