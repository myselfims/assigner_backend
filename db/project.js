import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lead: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users", // Table name for User model
      key: "id",
    },
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Ongoing", "Completed", "On Hold"),
    defaultValue: "Ongoing",
  },
  priority: {
    type: DataTypes.ENUM("Low", "Medium", "High"),
    defaultValue: "Medium",
  },
  budget: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Table name for User model
      key: "id",
    },
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Workspaces", // Table name for User model
      key: "id",
    },
  },
});

