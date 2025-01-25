import { DataTypes } from "sequelize";
import sequelize from "./db.js";


export const Organization = sequelize.define("Organization", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Attachments",
        key: "id",
      },
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });