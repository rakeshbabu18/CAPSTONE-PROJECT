import exp from 'express'
import {hash} from 'bcrypt'
import {register} from '../Services/authService.js'
import {UserTypeModel} from '../Models/UserModel.js'
import {checkAuthor} from '../MiddeWares/checkAuthor.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import {authenticate} from '../Services/authService.js'
import { verifyToken } from '../MiddeWares/verifyToken.js'

const userRoute = exp.Router()

//register user
userRoute.post('/users',async(req,res)=>{
    //get user from req
    let userObj = req.body
    //call register
    const newUserObj = await register({...userObj,role:"USER"})
    //send res
    res.status(201).json({message:"user created",payload:newUserObj})
})


//Read Articles
userRoute.get('/articles',verifyToken,async (req,res)=>{

    let articles = await ArticleModel
        .find({ isArticleActive: true })
        .populate("author", "firstName email");
    if(!articles){
        return res.status(401).json({message:"Article not found"})
    }
    res.status(200).json({message:"Article found",payload:articles})
})


//Adding a comment
userRoute.post('/comments/:id', verifyToken,async (req, res) => {

    let articleID = req.params.id
    
    // create comment object
    let updatedArticle = await ArticleModel.findByIdAndUpdate(
        articleID,
        {
            $push: {
                comments: {
                    comment: req.body.comment,
                    commentedBy: req.user.userid
                }
            }
        },
        { new: true }
    );

    //IF article not found return the res
    if (!updatedArticle) {
        return res.status(404).json({ message: "Article not found" });
    }

    //return res
    res.status(201).json({
        message: "Comment added successfully",
        payload: updatedArticle
    });
});


 


export default userRoute