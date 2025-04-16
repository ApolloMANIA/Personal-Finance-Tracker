import jwt from "jsonwebtoken";
import { decode } from "punycode";

export const authenticate = async (req, res, next)=>{
    const authToken = req.headers.authorization;

    if(!authToken || !authToken.startsWith('Bearer ')){
        return res.status(401).json({success:false})
    }
    try{
        const token = authToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.id;
        req.email = decode.email;

        next();
    }catch(error){
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({
                message: "Token is expired."
            });
        }
        return res.status(401).json({success:false, message:"Invalid Token"});
    }
    

}