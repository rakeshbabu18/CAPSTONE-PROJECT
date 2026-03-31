import exp from 'express'
import { register } from '../Services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import { verifyToken } from '../Middlewares/verifyToken.js'
import { upload } from '../config/multer.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import cloudinary from '../config/cloudinary.js'

const authorRoute = exp.Router()

//register author(public)
authorRoute.post('/users', upload.single("profileImageUrl"), async (req, res, next) => {

    let cloudinaryResult;

    try {
        //get user obj from req
        let userObj = req.body

        // Input validation
        if (!userObj.firstName || !userObj.lastName || !userObj.email || !userObj.password) {
            return res.status(400).json({ message: "All fields (firstName, lastName, email, password) are required" });
        }

        // Check for existing author/user
        const existingUser = await UserTypeModel.findOne({ email: userObj.email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        //  Step 1: upload image to cloudinary from memoryStorage (if exists)
        if (req.file) {
            cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        }

        //call the register function
        const newUserObj = await register({
            ...userObj,
            role: "AUTHOR",
            profileImageUrl: cloudinaryResult?.secure_url,
        })

        res.status(201).json({
            message: "Author created",
            payload: newUserObj
        })
    } catch (err) {
        // Step 2: rollback if upload failed
        if (cloudinaryResult?.public_id) {
            await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        }

        next(err); // send to your error middleware
    }
})


const setAllowedRoles = (roles) => (req, res, next) => {
    req.allowedRoles = roles;
    next();
};

//Create Article
authorRoute.post('/articles',setAllowedRoles(["AUTHOR"]), verifyToken,  async (req, res, next) => {

    try {
        //get article from req
        let articleObj = req.body

        //create Article document
        let newArticleDoc = new ArticleModel(articleObj)
        //save the doc
        let createdArticle = await newArticleDoc.save()

        //send res
        res.status(201).json({
            message: "Article created",
            payload: createdArticle
        })
    } catch (err) {
        next(err)
    }
})


//Read Articles of author(protected route)
authorRoute.get('/articles/:authorId',setAllowedRoles(["AUTHOR"]), verifyToken, async (req,res)=>{


    //get author id
    let aid = req.params.authorId

    // optionally include soft-deleted articles for author dashboard management
    const includeInactive = req.query.includeInactive === "true";

    const query = { author: aid };
    if (!includeInactive) {
        query.isArticleActive = true;
    }

    //read articles by this author
    let articles = await ArticleModel.find(query).populate("author", "firstName lastName email")
    
    //send res
    res.status(200).json({message:"Articles",payload:articles})
})

//edit articles
authorRoute.put('/articles',setAllowedRoles(["AUTHOR"]), verifyToken,   async (req, res) => {

    //get modified article from req
    let { articleId, title, category, content } = req.body
    let currentUserId = req.user.userId;

    //find article by ID and author ownership
    let articleOfDB = await ArticleModel.findOne({_id: articleId, author: currentUserId})

    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found or access denied" })
    }

    //update the article
    let updatedArticle = await ArticleModel.findByIdAndUpdate(
        articleId,
        {
            $set: {title, category,content}
        },
        {new : true, runValidators: true} 
    )

    //send res
    res.status(200).json({ message: "Article updated successfully" ,payload:updatedArticle})
})

// Soft delete article 
authorRoute.patch('/delete-article/:id', setAllowedRoles(["AUTHOR"]), verifyToken, async (req, res) => {

    let articleId = req.params.id;

    // find article
    let article = await ArticleModel.findById(articleId);

    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    // check if logged-in user is the author of this article
    if (article.author.toString() !== req.user.userId) {
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

// Restore soft deleted article
authorRoute.patch('/retrieve-article/:id', setAllowedRoles(["AUTHOR"]), verifyToken, async (req, res) => {

    let articleId = req.params.id;

    let article = await ArticleModel.findById(articleId);

    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    if (article.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden: You can retrieve only your articles" });
    }

    article.isArticleActive = true;
    await article.save();

    res.status(200).json({
        message: "Article retrieved successfully"
    });
});

export default authorRoute
