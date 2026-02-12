import exp from 'express'
import { UserTypeModel } from '../Models/UserModel.js'
import {authenticate} from '../Services/authService.js'
import { verifyToken } from '../MiddeWares/verifyToken.js'
import { ArticleModel } from '../Models/ArticleModel.js'

const adminRoute = exp.Router()

//reading articles by admin
adminRoute.get('/articles', verifyToken, async (req, res) => {

    console.log(req.user.role)
    if (req.user.role != "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    let articles = await ArticleModel.find();

    res.status(200).json({
        message: "All articles fetched",
        payload: articles
    });
});


//block users 
adminRoute.put('/block-user/:id', verifyToken, async (req, res) => {

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    let user = await UserTypeModel.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: "User blocked successfully" });
});



//unblock users
adminRoute.put('/unblock-user/:id', verifyToken, async (req, res) => {

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    let user = await UserTypeModel.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "User Unblocked successfully" });
});



export default adminRoute