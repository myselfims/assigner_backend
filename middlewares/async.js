export function asyncMiddleware(handler){
    return async (req,res,next)=>{
        try{
            await handler(req,res)
        }
        catch (err){
            console.log(err)
            res.send(err)
        }
    }
}