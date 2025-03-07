import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const Request = sequelize.define("Request", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true, // Optional message
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Workspaces", // Table name for Workspace model
      key: "id",
    },
    onDelete: "CASCADE",
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Table name for User model
      key: "id",
    },
    onDelete: "CASCADE",
  },
  targetUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Table name for User model
      key: "id",
    },
    onDelete: "CASCADE",
  },
  type: {
    type: DataTypes.ENUM("Invitation", "Ownership Transfer"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
    defaultValue: "pending",
  },  
  metadata: {
    type: DataTypes.JSON,
    allowNull: true, // Store extra information like message or custom data
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

