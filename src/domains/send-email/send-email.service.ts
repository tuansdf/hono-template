import { sendEmailRepository } from "~/domains/send-email/send-email.repository";
import { SendEmailSave } from "~/domains/send-email/send-email.type";

export class SendEmailService {
  public send = async (item: SendEmailSave) => {
    // TODO: actual send email
    await sendEmailRepository.save(item);
  };
}

export const sendEmailService = new SendEmailService();
