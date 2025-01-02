import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const queryInterface = sequelize.getQueryInterface();

export const User = sequelize.define('User', {
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
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

User.associate = (models) => {
    User.hasMany(models.Project, {
        foreignKey: 'createdBy',
        as: 'createdProjects',
    });
    
    User.belongsToMany(models.Project, {
        through: 'UserProjects',
        as: 'assignedProjects',
        foreignKey: 'userId',
    });
    
};


export const Project = sequelize.define('Project', {
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
        type: DataTypes.ENUM('Ongoing', 'Completed', 'On Hold'),
        defaultValue: 'Ongoing',
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium',
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
            model: 'Users', // Adjust this if `User` has a custom table name
            key: 'id',
        },
    },
});



Project.associate = (models) => {
    Project.belongsTo(User, {
        foreignKey: 'createdBy',
        as: 'creator',
    });
    
    Project.belongsToMany(User, {
        through: 'UserProjects',
        as: 'assignees',
        foreignKey: 'projectId',
    });    
};



export const UserProjects = sequelize.define('UserProjects', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
});




export const Task = sequelize.define('Task', {
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
        type: DataTypes.ENUM('To-Do', 'Assigned', 'In Progress', 'Done'),
        allowNull: false,
        defaultValue: 'To-Do',
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
        references: {
            model: 'Projects',
            key: 'id',
        },
        allowNull: false,
    },
});

Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

export const Comment = sequelize.define('Comment', {
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

export const OTP = sequelize.define('OTP', {
    code: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
        defaultValue: 'sample@gmail.com',
    },
});

// Use migrations for schema changes instead of sync({ alter: true })
async function migrate() {
    try {
        await sequelize.sync({alter:true});

        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

migrate();
