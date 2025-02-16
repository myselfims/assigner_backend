const notificationConfig = {
  newTaskAssigned: {
    title: "New Task Assigned",
    message:
      "You have been assigned a new task: {{taskName}} by {{assignedBy}}.",
    type: "info",
    priority: 3,
  },
  taskCompleted: {
    title: "Task Completed",
    message: "A task assigned to you has been marked as completed.",
    type: "success",
    priority: 2,
  },
  taskUpdated: {
    title: "Task Updated",
    message: "A task you are working on has been updated.",
    type: "info",
    priority: 3,
  },
  commentAdded: {
    title: "New Comment",
    message: "Someone has commented on your task.",
    type: "info",
    priority: 3,
  },
  mentionInComment: {
    title: "You Were Mentioned",
    message: "You have been mentioned in a comment.",
    type: "info",
    priority: 3,
  },
  dueDateReminder: {
    title: "Task Due Soon",
    message: "A task assigned to you is due soon.",
    type: "warning",
    priority: 2,
  },
  taskOverdue: {
    title: "Task Overdue",
    message: "A task assigned to you is overdue.",
    type: "error",
    priority: 1,
  },
  projectInvitation: {
    title: "Project Invitation",
    message: "You have been invited to a project.",
    type: "info",
    priority: 3,
  },
  accessGranted: {
    title: "Access Granted",
    message: "You have been granted access to a new project.",
    type: "success",
    priority: 2,
  },
  accessRevoked: {
    title: "Access Revoked",
    message: "Your access to a project has been revoked.",
    type: "warning",
    priority: 2,
  },
  systemMaintenance: {
    title: "System Maintenance",
    message: "Scheduled maintenance is coming up.",
    type: "warning",
    priority: 1,
  },
  systemOutage: {
    title: "System Outage",
    message: "The platform is experiencing an outage.",
    type: "error",
    priority: 1,
  },
};

export default notificationConfig;
