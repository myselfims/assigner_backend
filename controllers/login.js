import Joi from "joi";
import { User } from "../db/user.js";
import JWT from "jsonwebtoken";
import bcrypt from 'bcrypt'
import { asyncMiddleware } from "../middlewares/async.js";

export const login = asyncMiddleware( async (req, res)=>{
    const schema = Joi.object({
        email : Joi.string().required().email(),
        password : Joi.string().required()
    })

    const {error} = schema.validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({where:{email:req.body.email}})
    if (!user) return res.status(400).send('User not found! ')

    let check = await bcrypt.compare(req.body.password, user.password)

    if (!check) return res.status(400).send('Invalid credentials!')


    let token = JWT.sign(  {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        accountTypeId: user.accountTypeId,
      },'Imran@12')
    console.log(token)
    res.send({'token' : token,'user':user,})


})

