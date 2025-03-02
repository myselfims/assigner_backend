import { sendActivityLog } from "../socket/workspace.js";
import { ActivityLog } from "../db/activityLog.js";
import {activityMessages} from "../config/activityMessages.js";

export function generateLogContent(messageKey, values) {
  const message = activityMessages[messageKey];

  if (!message) {
    throw new Error(`Invalid message key: ${messageKey}`);
  }

  // Replace placeholders in all string properties
  const filledMessage = Object.fromEntries(
    Object.entries(message).map(([key, value]) => [
      key,
      typeof value === "string"
        ? value.replace(/{{(.*?)}}/g, (_, k) => values[k] || `{{${k}}}`)
        : value,
    ])
  );

  return filledMessage;
}

export async function createActivityLog(messageKey, dynamicData, io) {

  const log = generateLogContent(messageKey, dynamicData);

  let createdLog = await ActivityLog.create({
    ...log,
    ...dynamicData
  });

  // Emit real-time notification
  sendActivityLog(io, dynamicData.workspaceId, createdLog);

  return createdLog;
}
