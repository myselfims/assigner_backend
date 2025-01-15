import { Sequelize } from "sequelize";


const sequelize = new Sequelize(process.env.DB_DATABASE || 'assigner_db', 'root', process.env.DB_PASSWORD || 'Imran@12', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port : process.env.DB_PORT || 3306,
    pool: {
        max: 15,
        min: 5,
        idle: 20000,
        evict: 15000,
        acquire: 30000
      }, 
});

// Assuming this code is inside an async function or using .then() to handle promises
try {
    await sequelize.authenticate();
    console.log('Connected to database');
} catch (error) {
    console.error('Error while connecting to database', error);
}

export default sequelize;
