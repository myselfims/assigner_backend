// export const ACTIVITY_MESSAGES = {
//   NEW_WORKSPACE_CREATED: (workspaceName, createrName) =>
//     `📌 New Workspace '${workspaceName}' was created by '${createrName}' `,
//   USER_ADDED_TO_WORKSPACE: (addedByName, userName) =>
//     `📌 New user '${userName} added to workspace by '${addedByName}'' `,
//   TASK_COMPLETED: (taskName) => `✅ Task '${taskName}' was completed`,
//   PROJECT_CREATED: (projectName) =>
//     `📌 New Project '${projectName}' was created by '${createrName}'`,
//   TASK_ASSIGNED: (assignee, taskName) =>
//     `🚀 ${assignee} assigned a task '${taskName}' to you`,
//   USER_LOGIN: (username) => `🔑 ${username} logged in`,
//   FILE_UPLOADED: (filename) => `📂 File '${filename}' was uploaded`,
// };

export const activityMessages = {
  newWorkspaceCreated: {
    entityType: "workspace",
    action: "created",
    message: "📌 New Workspace '{{workspaceName}}' was created by '{{createrName}}'",
  },
  newProjectCreated: {
    entityType: "project",
    action: "created",
    message: "📌 New Project '{{projectName}}' was created by '{{creatorName}}'",
  },
};

export function generateLogContent(messageKey, values) {
  const message = activityMessages[messageKey];

  if (!message) {
    throw new Error(`Invalid message key: ${messageKey}`);
  }

  // Replace placeholders in all string properties
  const filledMessage = Object.fromEntries(
    Object.entries(message).map(([key, value]) => [
      key,
      typeof value === "string" ? value.replace(/{{(.*?)}}/g, (_, k) => values[k] || `{{${k}}}`) : value,
    ])
  );

  return filledMessage;
}

