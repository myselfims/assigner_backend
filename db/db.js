import { Sequelize } from "sequelize";

const sequelize = new Sequelize('railway', 'root', 'ykmXliGSDNKnh3oSlpTH', {
    host: 'containers-us-west-202.railway.app',
    dialect: 'mysql',
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
