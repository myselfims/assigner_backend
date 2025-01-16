import { DataTypes } from "sequelize";
import sequelize from "./db.js";
import { runSeeding, seedAccountTypes, seedRoles } from "./seedInitial.js";

const queryInterface = sequelize.getQueryInterface();

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

// User Model
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
      model: "Roles", // Should match the table name for Role
      key: "id",
    },
  },
  designationId: {
    // Foreign Key for Designation
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Designations", // Should match the table name for Designation
      key: "id",
    },
  },
  accountTypeId: {
    // Foreign Key for Designation
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "AccountTypes", // Should match the table name for Designation
      key: "id",
    },
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

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


export const Attachment = sequelize.define("Attachment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "attachments", // Optional: Define the table name explicitly
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Organization model
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

// Industry model
export const Industry = sequelize.define("Industry", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Junction table for many-to-many relationship
export const OrganizationIndustry = sequelize.define("OrganizationIndustry", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

// Define relationships
Organization.belongsToMany(Industry, {
  through: OrganizationIndustry,
  foreignKey: "organizationId",
  otherKey: "industryId",
});

Industry.belongsToMany(Organization, {
  through: OrganizationIndustry,
  foreignKey: "industryId",
  otherKey: "organizationId",
});


Organization.belongsTo(Attachment, { foreignKey: "logo", as: "Logo" });
Attachment.hasOne(Organization, { foreignKey: "logo", as: "Organization" });





// Designation Model
export const Designation = sequelize.define("Designation", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Role Model
export const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// Associations
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasOne(User, { foreignKey: "roleId" });

User.belongsTo(AccountType, { foreignKey: "accountTypeId", as: "accountType" });
AccountType.hasOne(User, { foreignKey: "accountTypeId" });

User.belongsTo(Designation, { foreignKey: "designationId", as: "designation" });
Designation.hasOne(User, { foreignKey: "designationId" });

export const RolePermissions = sequelize.define("RolePermissions", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export const Permission = sequelize.define("Permission", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

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
    type: DataTypes.STRING,
    allowNull: false,
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
      model: "Users", // Adjust this if `User` has a custom table name
      key: "id",
    },
  },
});

User.associate = (models) => {
  User.hasMany(models.Project, {
    foreignKey: "createdBy",
    as: "createdProjects",
  });

  User.belongsToMany(models.Project, {
    through: "UserProject",
    as: "assignedProjects",
    foreignKey: "userId",
  });
};

Project.associate = (models) => {
  Project.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
  });

  Project.belongsToMany(User, {
    through: "UserProject",
    as: "assignees",
    foreignKey: "projectId",
  });
};

export const UserProject = sequelize.define("UserProject", {
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
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Projects",
      key: "id",
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
});

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
    allowNull: false,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("To-Do", "Assigned", "In Progress", "Done"),
    allowNull: false,
    defaultValue: "To-Do",
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
});

Task.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Task, { foreignKey: "projectId", as: "tasks" });

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
  },
  parentType: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
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

// Use migrations for schema changes instead of sync({ alter: true })
async function migrate() {
  try {
    await sequelize.sync({ alter: true });
    // runSeeding()
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

migrate();
