import { Sequelize } from "sequelize";


const sequelize = new Sequelize('tmsdatabase', 'root', 'Imran@12', {
    host: 'localhost',
    dialect: 'mysql' 
});

try{
    await sequelize.authenticate()
    console.log('Connected to database')
}
catch(er){
    console.log('Error while connecting to database',er)
}

export default sequelize;