import { sendEmailRepository } from "~/domains/send-email/send-email.repository";
import { SendEmailSave } from "~/domains/send-email/send-email.type";

class SendEmailService {
  public async send(item: SendEmailSave) {
    // TODO: actually send email
    await sendEmailRepository.save(item);
  }
}

export const sendEmailService = new SendEmailService();
