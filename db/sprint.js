import { DataTypes } from "sequelize";
import sequelize from "./db.js";


export const Sprint = sequelize.define("Sprint", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects", // Replace "Projects" with the actual name of your Project model or table
        key: "id", // Ensure the `id` column in the Project model is the primary key
      },
      onUpdate: "CASCADE", // Automatically update if the project ID changes
      onDelete: "CASCADE", // Automatically delete sprints if the project is deleted
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // Adding this to ensure every sprint has a title
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Not Started", "In Progress", "Completed"),
      defaultValue: "Not Started",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default index value, can be used when new tasks are created
    },
  });