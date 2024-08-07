import { sendNotificationRepository } from "~/domains/send-notification/send-notification.repository";
import { SendNotificationSave } from "~/domains/send-notification/send-notification.type";

class SendNotificationService {
  public async send(item: SendNotificationSave) {
    // TODO: actually send notification
    await sendNotificationRepository.save(item);
  }
}

export const sendNotificationService = new SendNotificationService();
