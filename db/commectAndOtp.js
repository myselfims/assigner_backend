import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
    parentType: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  });
  
  export const OTP = sequelize.define("OTP", {
    code: {
      type: DataTypes.INTEGER,
      // unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      defaultValue: "sample@gmail.com",
    },
  });