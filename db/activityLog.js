import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const ActivityLog = sequelize.define("ActivityLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Set `false` if it's mandatory
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false, // Example: 'Created', 'Updated', 'Deleted'
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false, // Example: 'Task', 'Project', 'User'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false, // ID of the affected entity
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false, // Example: 'User John updated Task #23'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true, // Store IP address if needed for auditing
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true, // Store additional info like previous values, changes, etc.
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default ActivityLog;
