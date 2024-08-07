import { eq } from "drizzle-orm";
import {
  ENV_EMAIL_ACTIVATE_ACCOUNT_BASE_URL,
  ENV_EMAIL_RESET_PASSWORD_BASE_URL,
  ENV_JWT_REFRESH_LIFETIME,
  ENV_TOKEN_ACTIVATE_ACCOUNT_LIFETIME,
  ENV_TOKEN_RESET_PASSWORD_LIFETIME,
} from "~/constants/env.constant";
import { STATUS } from "~/constants/status.constant";
import { TYPE } from "~/constants/type.constant";
import { db } from "~/database/db";
import { JWT_TYPE } from "~/domains/auth/auth.constant";
import {
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  ResetPasswordRequestDTO,
} from "~/domains/auth/auth.type";
import { authUtils } from "~/domains/auth/auth.util";
import { permissionRepository } from "~/domains/permission/permission.repository";
import { sendEmailService } from "~/domains/send-email/send-email.service";
import { SendEmailSave } from "~/domains/send-email/send-email.type";
import { tokenService } from "~/domains/token/token.service";
import { TokenSave } from "~/domains/token/token.type";
import { userRepository } from "~/domains/user/user.repository";
import { UserDTO } from "~/domains/user/user.type";
import { TokenTable } from "~/entities/token.entity";
import { UserTable } from "~/entities/user.entity";
import { CustomException } from "~/exceptions/custom-exception";
import { TFn } from "~/i18n/i18n.type";
import { dated } from "~/lib/date/date";
import { hashUtils } from "~/lib/hash/hash.util";
import { logger } from "~/lib/logger/logger";

class AuthService {
  public async login(requestDTO: LoginRequestDTO): Promise<UserDTO> {
    const user = await userRepository.findTopByUsernameOrEmailWithPassword(requestDTO.username);
    if (!user) {
      throw new CustomException("auth.error.unauthenticated", 401);
    }
    const isPasswordMatch = await hashUtils.verify(String(user.password), requestDTO.password);
    if (!isPasswordMatch) {
      throw new CustomException("auth.error.unauthenticated", 401);
    }
    if (user.status !== STATUS.ACTIVE) {
      throw new CustomException("user.error.not_activated", 401);
    }
    const permissions = await permissionRepository.findAllByUserId(Number(user.id));
    const { password, ...result } = user;
    const tokenPayload: UserDTO = { ...result, permissions };
    const accessToken = await authUtils.createToken({ user: tokenPayload, type: JWT_TYPE.ACCESS });
    const refreshToken = await this.createRefreshToken(user);
    return { ...result, accessToken, refreshToken: refreshToken.value };
  }

  public async register(requestDTO: RegisterRequestDTO, t: TFn) {
    const existUserWithUsername = await userRepository.existByUsername(requestDTO.username);
    if (existUserWithUsername) {
      throw new CustomException("dynamic.error.not_available:::field.username", 409);
    }
    const existUserWithEmail = await userRepository.existByEmail(requestDTO.email);
    if (existUserWithEmail) {
      // https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-creation
      logger.error("Register with registered email");
      return;
    }
    requestDTO.password = await hashUtils.hash(requestDTO.password);
    const saved = await userRepository.save({ ...requestDTO, status: STATUS.PENDING });
    if (!saved) {
      throw new CustomException();
    }
    const token = await this.createActivateAccountToken(saved);
    await this.sendActivateAccountEmail(saved, token.value || "", t);
  }

  public async refreshToken(userId: number, tokenValue: string) {
    const token = await tokenService.findByValueId(tokenValue);
    if (!token) {
      throw new CustomException("auth.error.unauthenticated", 401);
    }
    if (token.status !== STATUS.ACTIVE || token.foreignId !== userId) {
      throw new CustomException("auth.error.unauthenticated", 401);
    }
    const user = await userRepository.findTopById(userId);
    if (!user) {
      throw new CustomException("auth.error.unauthenticated", 401);
    }
    if (user.status !== STATUS.ACTIVE) {
      throw new CustomException("user.error.not_activated", 401);
    }
    const permissions = await permissionRepository.findAllByUserId(Number(user.id));
    const { password, ...result } = user;
    const tokenPayload: UserDTO = { ...result, permissions };
    const accessToken = await authUtils.createToken({ user: tokenPayload, type: JWT_TYPE.ACCESS });
    return {
      accessToken,
    };
  }

  public async forgotPassword(requestDTO: ForgotPasswordRequestDTO, t: TFn) {
    const user = await userRepository.findTopByUsernameOrEmail(requestDTO.username);
    if (!user) {
      // https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#password-recovery
      logger.error("Request password recovery with not registered email");
      return;
    }
    const token = await this.createResetPasswordToken(user);
    await this.sendResetPasswordEmail(user, token.value || "", t);
  }

  public async resetPassword(requestDTO: ResetPasswordRequestDTO) {
    const tokenValue = requestDTO.t;
    const token = await tokenService.findByValueId(tokenValue);
    if (!token || !token.foreignId || token.status !== STATUS.ACTIVE) {
      throw new CustomException("auth.error.token_used_or_invalid", 401);
    }
    try {
      await authUtils.verifyToken(token.value || "", JWT_TYPE.RESET_PASSWORD);
    } catch (e) {
      throw new CustomException("auth.error.token_used_or_invalid");
    }
    const user = await userRepository.findTopById(token.foreignId);
    if (!user) {
      throw new CustomException("dynamic.error.not_found:::field.user", 404);
    }
    const hashedPassword = await hashUtils.hash(requestDTO.password);
    await db.main
      .update(TokenTable)
      .set({ status: STATUS.INACTIVE })
      .where(eq(TokenTable.id, Number(token.id)));
    await db.main
      .update(UserTable)
      .set({ password: hashedPassword })
      .where(eq(UserTable.id, Number(user.id)));
  }

  public async activateAccount(tokenValue: string) {
    const token = await tokenService.findByValueId(tokenValue);
    if (!token || !token.foreignId || token.status !== STATUS.ACTIVE) {
      throw new CustomException("auth.error.token_used_or_invalid", 401);
    }
    try {
      await authUtils.verifyToken(token.value || "", JWT_TYPE.ACTIVATE_ACCOUNT);
    } catch (e) {
      throw new CustomException("auth.error.token_used_or_invalid");
    }
    const user = await userRepository.findTopById(token.foreignId);
    if (!user) {
      throw new CustomException("dynamic.error.not_found:::field.user", 404);
    }
    if (user.status === STATUS.ACTIVE) {
      throw new CustomException("auth.error.already_activated", 400);
    }
    await db.main
      .update(TokenTable)
      .set({ status: STATUS.INACTIVE })
      .where(eq(TokenTable.id, Number(token.id)));
    await db.main
      .update(UserTable)
      .set({ status: STATUS.ACTIVE })
      .where(eq(UserTable.id, Number(user.id)));
  }

  private async sendResetPasswordEmail(user: UserDTO, token: string, t: TFn) {
    const item: SendEmailSave = {
      fromEmail: "PLACEHOLDER",
      toEmail: user.email,
      type: TYPE.RESET_PASSWORD,
      subject: t("auth.message.reset_password_email_subject"),
      content: t("auth.message.reset_password_email_content", {
        1: user.username,
        2: ENV_EMAIL_RESET_PASSWORD_BASE_URL + token,
      }),
    };
    await sendEmailService.send(item);
  }

  private async sendActivateAccountEmail(user: UserDTO, token: string, t: TFn) {
    const item: SendEmailSave = {
      fromEmail: "PLACEHOLDER",
      toEmail: user.email,
      type: TYPE.ACTIVATE_ACCOUNT,
      subject: t("auth.message.activate_account_email_subject"),
      content: t("auth.message.activate_account_email_content", {
        1: user.username,
        2: ENV_EMAIL_ACTIVATE_ACCOUNT_BASE_URL + token,
      }),
    };
    await sendEmailService.send(item);
  }

  private async createActivateAccountToken(user: UserDTO) {
    const tokenValue = await authUtils.createToken({ type: JWT_TYPE.ACTIVATE_ACCOUNT, username: user.username || "" });
    const expiresAt = dated().add(ENV_TOKEN_ACTIVATE_ACCOUNT_LIFETIME, "minute").toISOString();
    const item: TokenSave = {
      foreignId: user.id,
      value: tokenValue,
      type: TYPE.ACTIVATE_ACCOUNT,
      expiresAt,
      status: STATUS.ACTIVE,
    };
    return tokenService.saveValueWithId(item);
  }

  private async createResetPasswordToken(user: UserDTO) {
    const tokenValue = await authUtils.createToken({ type: JWT_TYPE.RESET_PASSWORD, username: user.username || "" });
    const expiresAt = dated().add(ENV_TOKEN_RESET_PASSWORD_LIFETIME, "minute").toISOString();
    const item: TokenSave = {
      foreignId: user.id,
      value: tokenValue,
      type: TYPE.RESET_PASSWORD,
      expiresAt,
      status: STATUS.ACTIVE,
    };
    return tokenService.saveValueWithId(item);
  }

  private async createRefreshToken(user: UserDTO) {
    const tokenValue = await authUtils.createToken({ type: JWT_TYPE.REFRESH, user });
    const expiresAt = dated().add(ENV_JWT_REFRESH_LIFETIME, "minute").toISOString();
    const item: TokenSave = {
      foreignId: user.id,
      value: tokenValue,
      type: TYPE.REFRESH_TOKEN,
      expiresAt,
      status: STATUS.ACTIVE,
    };
    return tokenService.saveValueWithId(item);
  }
}

export const authService = new AuthService();
