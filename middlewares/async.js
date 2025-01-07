export function asyncMiddleware(handler){
    return async (req,res,next)=>{
        try{
            await handler(req,res)
        }
        catch (err){
            console.log(err)
            res.status(500).send({ error: err.message || "An unexpected error occurred" });

        }
    }
}