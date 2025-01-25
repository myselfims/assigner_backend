import { DataTypes } from "sequelize";
import sequelize from "./db.js"; // Import sequelize after initialization

export const AccountType = sequelize.define("AccountType", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
