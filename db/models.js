import { DataTypes } from "sequelize";
import sequelize from "./db.js";
const queryInterface = sequelize.getQueryInterface()


export const User = sequelize.define('User', {
    // Model attributes are defined here
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
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
      allowNull : false,
      unique : true,
      validate : {
        isEmail : true
      }
    },
    password : {
        type : DataTypes.STRING,
        validate : {
            min : 8,
            max : 12
        }
    },
    isAdmin : {
        type : DataTypes.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    isVerfied : {
        type : DataTypes.BOOLEAN,
        allowNull : false,
        defaultValue : true
    }

  }, {
    // Other model options go here
});

User.associate = (models) => {
    // Association for tasks assigned by the user
    User.hasMany(models.Task, {
        foreignKey: 'assignedById',
        as: 'AssignedTasks',
    });

    // Association for tasks assigned to the user
    User.hasMany(models.Task, {
        foreignKey: 'assignedToId',
        as: 'TasksAssignedTo',
    });
};


export const Task = sequelize.define('Task',{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    title : {
        type : DataTypes.STRING,
        allowNull : false
    },
    description : {
        type : DataTypes.TEXT,
        allowNull : false
    },
    deadline : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    status: {
        type: DataTypes.ENUM('Assigned', 'In Progress', 'Done'),
        allowNull: false,
        defaultValue: 'Assigned', // Change default value as needed
    },
    assignedById: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export const Comment = sequelize.define('Comment',{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    comment : {
        type : DataTypes.STRING,
        allowNull : false
    },
    taskId : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    userId : {
        type : DataTypes.INTEGER,
        allowNull : false
    }
    
})



async function Migrate(){
    try{
        User.sync({alter:true})
        Task.sync()
        Comment.sync()
    }
    catch(er){
        console.log('Error while migrating',er)
    }
}

Migrate()




// module.exports = {
//     up: async (queryInterface, Sequelize) => {
//       await queryInterface.addColumn('Users', 'avatar', {
//         type: Sequelize.STRING,
//         allowNull: true,
//         defaultValue: null,
//       });
//     },
  
//     down: async (queryInterface, Sequelize) => {
//       await queryInterface.removeColumn('Users', 'avatar');
//     },
//   };


