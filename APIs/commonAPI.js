import exp from 'express'
import {authenticate} from '../Services/authService.js'
import { verifyToken } from '../MiddeWares/verifyToken.js'
import { UserTypeModel } from '../Models/UserModel.js'
import bcrypt from 'bcryptjs'

export const commonRouter=exp.Router()

//login
commonRouter.post("/authenticate",async(req,res)=>{
        
            //get user CRED object
            let userCRED = req.body
            //call authenticate service
            let { token,user } = await authenticate(userCRED)
            //save token as HTTPonly cookie
            res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })
        //send res
        res.json({message: "Login successful",payload: user})
    
    
})
//logout
commonRouter.get("/logout",async (req,res)=>{
        res.clearCookie('token',{
        httpOnly:true,
        sameSite:"lax",
        secure:false
    })

    res.json({message:"logout successfully"})
})

//changing password route
commonRouter.put('/change-password', async (req, res) => {

    let userCRED = req.body;

    // call authenticate properly
    let result = await authenticate({
        email: userCRED.email,
        password: userCRED.password
    });

    if (!result.user) {
        return res.status(401).json({ message:"user not found" });
    }

    // get result document
    let userDoc = await UserTypeModel.findOne({ email: userCRED.email });

    //hash the new password
    let newHashedPassword = await bcrypt.hash(userCRED.newPassword, 10);

    //insert the updated password into the document
    userDoc.password = newHashedPassword;

    //save the doc in the database
    await userDoc.save();

    //return res
    res.status(200).json({ message: "Password updated successfully" });
});

