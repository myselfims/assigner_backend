import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const CalendarEvent = sequelize.define("CalendarEvent", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Projects", key: "id" }, // Foreign key
    onDelete: "CASCADE",
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM("deadline", "meeting", "reminder"),
    defaultValue: "reminder",
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
});
