export const ACTIVITY_MESSAGES = {
    TASK_COMPLETED: (taskName) => `✅ Task '${taskName}' was completed`,
    PROJECT_CREATED: (projectName) => `📌 New Project '${projectName}' was created`,
    TASK_ASSIGNED: (assignee, taskName) => `🚀 ${assignee} assigned a task '${taskName}' to you`,
    USER_LOGIN: (username) => `🔑 ${username} logged in`,
    FILE_UPLOADED: (filename) => `📂 File '${filename}' was uploaded`,
  };
  