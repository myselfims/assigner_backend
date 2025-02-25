import { DataTypes } from "sequelize";
import sequelize from "./db.js";
import { User } from "./user.js"; // Assuming you have a User model
import { Project } from "./project.js";
import { Workspace } from "./workspace.js";

export const ActivityLog = sequelize.define("ActivityLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Enforce foreign key constraint
      key: "id",
    },
    onDelete: "CASCADE", // If user is deleted, remove their logs
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Workspace,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Project,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  redirectUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default ActivityLog;
