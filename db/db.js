import { Sequelize } from "sequelize";


const sequelize = new Sequelize('railway', 'root', 'ykmXliGSDNKnh3oSlpTH', {
    host: 'containers-us-west-202.railway.app',
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