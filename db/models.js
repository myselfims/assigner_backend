import { Sequelize, DataTypes } from "sequelize";
import sequelize from "./db.js"; // Assuming you already have the sequelize instance
import { Organization } from "./organization.js";
import { Industry } from "./industry.js";
import { Attachment } from "./attachment.js";
import { User } from "./user.js";
import { Role } from "./roleAndDesignation.js";
import { AccountType } from "./accountType.js";
import { Designation } from "./roleAndDesignation.js";
import { Project } from "./project.js";
import { Task } from "./task.js";
import { Status } from "./status.js";
import { UserProject } from "./userProject.js";
import { Message } from "./message.js";
import { PinnedMessage } from "./pinnedMessage.js";

// Define relationships directly on models
Organization.belongsToMany(Industry, {
  through: "OrganizationIndustry",
  foreignKey: "organizationId",
  otherKey: "industryId",
});

Industry.belongsToMany(Organization, {
  through: "OrganizationIndustry",
  foreignKey: "industryId",
  otherKey: "organizationId",
});

Organization.belongsTo(Attachment, { foreignKey: "logo", as: "Logo" });
Attachment.hasOne(Organization, { foreignKey: "logo", as: "Organization" });

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasOne(User, { foreignKey: "roleId" });

User.belongsTo(AccountType, { foreignKey: "accountTypeId", as: "accountType" });
AccountType.hasOne(User, { foreignKey: "accountTypeId" });

User.belongsTo(Designation, { foreignKey: "designationId", as: "designation" });
Designation.hasOne(User, { foreignKey: "designationId" });

Project.hasMany(Status, { foreignKey: "projectId", onDelete: "CASCADE" });

User.hasMany(Project, {
  foreignKey: "createdBy",
  as: "createdProjects",
});

Project.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

User.belongsToMany(Project, {
  through: "UserProject",
  as: "assignedProjects",
  foreignKey: "userId",
});

Project.belongsToMany(User, {
  through: "UserProject",
  as: "assignees",
  foreignKey: "projectId",
});

Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });


// One User can have many UserProjects
User.hasMany(UserProject, {
  foreignKey: "userId",
  as: "userProjects", // Alias for the association
});

// One Project can have many UserProjects
Project.hasMany(UserProject, {
  foreignKey: "projectId",
  as: "userProjects", // Alias for the association
});

// UserProject belongs to one User
UserProject.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // Alias for the association
});

UserProject.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role", // Alias for the association
});

Role.hasMany(UserProject, {
  foreignKey: "roleId",
  as: "userProjects", // Alias for the association
});


// UserProject belongs to one Project
UserProject.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project", // Alias for the association
});

Task.belongsTo(User, { as: "assignedBy", foreignKey: "assignedById" });
Task.belongsTo(User, { as: "assignedTo", foreignKey: "assignedToId" });

Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
User.hasMany(Message, { foreignKey: "senderId" });


// Associations
PinnedMessage.belongsTo(Message, { foreignKey: "messageId" });
PinnedMessage.belongsTo(User, { foreignKey: "userId" }); // User who pinned the message
PinnedMessage.belongsTo(Project, { foreignKey: "projectId" }); // For project messages
PinnedMessage.belongsTo(User, { foreignKey: "receiverId", as: "Receiver" }); // For direct messages

// Use migrations for schema changes instead of sync({ alter: true })
async function migrate() {
  console.log('running migrations')
  try {
    await sequelize.sync({alter:true});
    // runSeeding();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

migrate(

);
