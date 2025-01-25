import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    // Foreign Key for Role
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Roles",
      key: "id",
    },
  },
  designationId: {
    // Foreign Key for Designation
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Designations",
      key: "id",
    },
  },
  accountTypeId: {
    // Foreign Key for Account Type
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "AccountTypes",
      key: "id",
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

