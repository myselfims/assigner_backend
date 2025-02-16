import { DataTypes } from "sequelize";
import sequelize from "./db.js";


export const Task = sequelize.define("Task", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "1",
    },
    assignedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      references: { model: "Projects", key: "id" },
      allowNull: false,
    },
    sprintId: {
      type: DataTypes.INTEGER,
      references: { model: "Sprints", key: "id" },
      allowNull: true, // Null for tasks not tied to sprints
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default index value, can be used when new tasks are created
    },
    rank : {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default index value, can be used when new tasks are created
    },
  });