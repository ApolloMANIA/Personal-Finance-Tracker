import User from "../models/UserSchema.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
    },process.env.JWT_SECRET_KEY,{expiresIn:"15d"});
};

export const signup = async (req,res) =>{
    try{
        const {name, email, password}= req.body;
        if(!email || !password){
            return res.status(400).send("Email and password are required.")
        }
        const userExists = await User.findOne({email});
        if (userExists){return res.status(409).send("User already exists")};

        const salt = await bcrypt.genSalt(15);
        const hashPassword = await bcrypt.hash(password,salt);

        const user = await User.create({name, email, password:hashPassword});

        return res.status(200).json({success:true});

    }catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}

export const login = async (req,res)=>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if (user) {
            const passwordMatch = await bcrypt.compare(password,user.password);
            if(passwordMatch){
                const token = generateToken(user);
                const id = user._id;
                console.log(id)
                res.status(200).json({success:true,data:{token,id}})
            }

        }else{
            res.status(400).json({success:false})
        }

    }catch(error){

    }
}
