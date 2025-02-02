import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const PinnedMessage = sequelize.define(
  "PinnedMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
        onDelete: "CASCADE", // Delete pins when user is deleted
      },
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Messages",
        key: "id",
        onDelete: "CASCADE", // Delete pins when message is deleted
      },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional for direct messages
      references: {
        model: "Projects",
        key: "id",
        onDelete: "CASCADE", // Delete pins when project is deleted
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional for project messages
      references: {
        model: "Users",
        key: "id",
        onDelete: "CASCADE", // Delete pins when receiver is deleted
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    indexes: [
      // Ensure a unique combination to prevent duplicate pins
      {
        unique: true,
        fields: ["userId", "messageId", "projectId", "receiverId"],
        name: "unique_pin_constraint",
      },
    ],
  }
);
