import { DataTypes } from "sequelize";
import sequelize from "./db.js";

export const UserWorkspace = sequelize.define("UserWorkspace", {
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
    },
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Workspaces",
      key: "id",
    },
  },
  roleId: { // Optional: Define user roles within a workspace
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Roles",
      key: "id",
    },
  },
  isDefault : {
    type : DataTypes.BOOLEAN,
    allowNull : false,
    defaultValue : false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
});
