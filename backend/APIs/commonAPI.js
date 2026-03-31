import exp from 'express'
import {authenticate, register} from '../Services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js'
import bcrypt from 'bcryptjs'
import { verifyToken } from '../Middlewares/verifyToken.js'

export const commonRouter=exp.Router()

const setAllowedRoles = (roles) => (req, res, next) => {
    req.allowedRoles = roles;
    next();
};

//login
commonRouter.post("/authenticate",async(req,res,next)=>{
    try {
        //get user CRED object
        let userCRED = req.body
        
        // Input validation
        if (!userCRED.email || !userCRED.password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        //call authenticate service
            let { token,user } = await authenticate(userCRED)
            //save token as HTTPonly cookie
            res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })
        //send res
                const { _id, email, role, firstName, lastName } = user;
        res.json({
  message: "Login successful",
    payload: {
        userId: _id,
        email,
        role,
        firstName,
        lastName,
        profileImageUrl: user.profileImageUrl || user.profileImageurl || null,
    }
})

    } catch (err) {
        next(err);
    }
})

// create admin (protected by ADMIN_SECRET env)
commonRouter.post('/create-admin', async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, profileImageUrl, profileImageurl, adminSecret } = req.body;

        if (!firstName || !email || !password) {
            return res.status(400).json({ message: 'firstName, email and password are required' });
        }

        if (!process.env.ADMIN_SECRET) {
            return res.status(500).json({ message: 'ADMIN_SECRET is not configured on server' });
        }

        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: 'Invalid admin secret' });
        }
        // Check for existing user
        const existingUser = await UserTypeModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }
        const newAdmin = await register({
            firstName,
            lastName,
            email,
            password,
            role: 'ADMIN',
            profileImageUrl: profileImageUrl || profileImageurl,
        });

        res.status(201).json({
            message: 'Admin created successfully',
            payload: newAdmin,
        });
    } catch (err) {
        next(err);
    }
});

//logout
commonRouter.get("/logout",async (req,res)=>{
        res.clearCookie('token',{
        httpOnly:true,
        sameSite:"lax",
        secure:false
    })

    res.json({message:"logout successfully"})
})

//changing password route (protected)
commonRouter.put('/change-password', setAllowedRoles(["USER", "AUTHOR", "ADMIN"]), verifyToken, async (req, res, next) => {
    try {
        let userCRED = req.body;

        if (req.user.email !== userCRED.email) {
            return res.status(403).json({ message: 'Cannot change password for another user' });
        }

        // call authenticate properly
        let { user } = await authenticate({
            email: userCRED.email,
            password: userCRED.password
        });

        // get result document
        let userDoc = await UserTypeModel.findOne({ email: user.email });

        //hash the new password
        let newHashedPassword = await bcrypt.hash(userCRED.newPassword, 10);

        //insert the updated password into the document
        userDoc.password = newHashedPassword;

        //save the doc in the database
        await userDoc.save();

        //return res
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
});

//handling refresh
commonRouter.get('/check-auth', setAllowedRoles(["USER", "AUTHOR", "ADMIN"]), verifyToken, async (req, res) => {
    res.status(200).json({
        message:"unauthorized",
        payload:req.user
    })
});
