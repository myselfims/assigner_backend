import { sendNotification } from "../socket/notification.js";
import { Notification } from "../db/notification.js";
import NOTIFICATIONS from "../config/notificationConfig.js";

function formatNotification(template, data) {
  let formattedMessage = template;
  Object.keys(data).forEach((key) => {
    const placeholder = `{{${key}}}`;
    formattedMessage = formattedMessage.replace(new RegExp(placeholder, "g"), data[key]);
  });
  return formattedMessage;
}

export async function createNotifications(userIds, notificationKey, dynamicData, io) {
  const template = NOTIFICATIONS[notificationKey];

  if (!template) {
    console.error("Notification key not found:", notificationKey);
    return null;
  }

  const title = template.title;
  const message = formatNotification(template.message, dynamicData);
  const redirectUrl = template.redirectUrl ? formatNotification(template.redirectUrl, dynamicData) : null;
  console.log('redirectUrl', redirectUrl);

  // Create notifications for each user in parallel
  const notifications = await Promise.all(
    userIds.map(async (userId) => {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type: template.type,
        priority: template.priority,
        redirectUrl,
      });
      // Emit real-time notification for the current user
      sendNotification(io, userId, notification);
      return notification;
    })
  );

  return notifications;
}
