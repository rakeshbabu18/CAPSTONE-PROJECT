import exp from 'express'
import { register, authenticate } from '../Services/authService.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import { checkAuthor } from '../MiddeWares/checkAuthor.js'
import { verifyToken } from '../MiddeWares/verifyToken.js'

const authorRoute = exp.Router()

//register author(public)
authorRoute.post('/users', async (req, res) => {

    //get user obj from req
    let userObj = req.body
    //call the register function
    const newUserObj = await register({
        ...userObj,
        role: "AUTHOR"
    })

    res.status(201).json({
        message: "Author created",
        payload: newUserObj
    })
})


//Create Article
authorRoute.post('/articles',verifyToken,checkAuthor, async (req, res) => {

    
     //get article from req
     let articleObj = req.body

     //create Article document
     let newArticleDoc = new ArticleModel(articleObj)
     //save the doc
     let createdArticle = await newArticleDoc.save()

     //send res
     res.status(201).json({
        message: "Article created",
        createdArticle
    })
})


//Read Articles of author(protected route)
authorRoute.get('/articles/:authorId',verifyToken,checkAuthor,async (req,res)=>{


    //get author id
    let aid = req.params.authorId

    //read articles by this author which are active
    let articles = await ArticleModel.find({author:aid,isArticleActive:true}).populate("author", "firstName email")
    
    //send res
    res.status(200).json({message:"Articles",payload:articles})
})

//edit articles
authorRoute.put('/articles',verifyToken, checkAuthor, async (req, res) => {

    //get modified article from req
    let {  articleId, title, category, content,author } = req.body

    //find article
    let articleOfDB = await ArticleModel.findOne({_id: articleId,author: author})

    if (!articleOfDB) {
        return res.status(401).json({ message: "Article not found" })
    }

    //update the article
    let updatedArticle = await ArticleModel.findByIdAndUpdate(
        articleId,
        {
            $set: {title, category,content}
        },
        {new : true} 
    )

    //send res
    res.status(200).json({ message: "Article updated successfully" ,payload:updatedArticle})
})

// Soft delete article 
authorRoute.delete('/delete-article/:id', verifyToken, async (req, res) => {

    let articleId = req.params.id;

    // find article
    let article = await ArticleModel.findById(articleId);

    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    // check if logged-in user is the author of this article
    if (article.author.toString() !== req.user.userid) {
        return res.status(403).json({ message: "Forbidden: You can delete only your articles" });
    }

    // soft delete
    article.isArticleActive = false;

    await article.save();

    //return res
    res.status(200).json({
        message: "Article deleted successfully"
    });
});

export default authorRoute
