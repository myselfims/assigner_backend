import { asyncMiddleware } from "../middlewares/async.js";

export const getAllNotifications = asyncMiddleware(async (req, res)=>{
    res.send({"msg" : "notification"})
})