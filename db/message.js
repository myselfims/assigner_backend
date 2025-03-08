import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null for group chats
    references: {
      model: "Users",
      key: "id",
    },
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Null for global chat
    references: {
      model: "Projects",
      key: "id",
    },
  },
  workspaceId : {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Workspaces",
      key: "id",
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true, // Only used if type is "image" or "file"
  },
  type: {
    type: DataTypes.ENUM("text", "video", "image", "file"),
    defaultValue: "text",
  },
  isGroupChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // True for project chats
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },  
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
