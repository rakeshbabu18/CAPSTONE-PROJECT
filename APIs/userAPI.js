import exp from 'express'
import { register } from '../Services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import { verifyToken } from '../Middlewares/verifyToken.js'
import { upload } from '../config/multer.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import cloudinary from '../config/cloudinary.js'

const userRoute = exp.Router()

//register user
userRoute.post(
        "/users",
        upload.single("profileImageUrl"), // multer middleware to handle single file upload
        async (req, res, next) => {
        let cloudinaryResult;

            try {
                let userObj = req.body;

                //  Step 1: upload image to cloudinary from memoryStorage (if exists)
                if (req.file) {
                cloudinaryResult = await uploadToCloudinary(req.file.buffer);
                }

                // Step 2: call existing register()
                const newUserObj = await register({
                ...userObj,
                role: "USER",
                profileImageUrl: cloudinaryResult?.secure_url,
                });

                res.status(201).json({
                message: "user created",
                payload: newUserObj,
                });

            } catch (err) {

                // Step 3: rollback 
                if (cloudinaryResult?.public_id) {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id);
                }

                next(err); // send to your error middleware
            }

        }
        );



const setAllowedRoles = (roles) => (req, res, next) => {
    req.allowedRoles = roles;
    next();
};

//Read Articles
userRoute.get('/articles', setAllowedRoles(["USER", "AUTHOR"]), verifyToken, async (req, res) => {

    let articles = await ArticleModel
        .find({ isArticleActive: true })
        .populate("comments.user", "firstName lastName email");
    if (!articles) {
        return res.status(401).json({ message: "Article not found" })
    }
    res.status(200).json({ message: "Article found", payload: articles })
})


//Read Article by ID (NEW ENDPOINT)
userRoute.get('/article/:id', setAllowedRoles(["USER", "AUTHOR"]), verifyToken, async (req, res) => {
    
    let articleId = req.params.id;
    
    let article = await ArticleModel.findById(articleId)
        .populate("author", "firstName lastName email");
        
    if (!article || !article.isArticleActive) {
        return res.status(404).json({ error: "Article not found" });
    }
    
    res.status(200).json({ payload: article });
})


//Adding a comment
userRoute.put('/articles', setAllowedRoles(["USER"]), verifyToken, async (req, res) => {

    let { articleId, comment } = req.body
    let user = req.user.userId;

  // create comment object  
  let articleWithComment = await ArticleModel.findByIdAndUpdate(
      articleId,
      {
          $push:{ 
              comments:{ 
                  user ,comment 
              }
          }
      },
      {new :true , runValidators:true}
  ).populate("comments.user", "firstName lastName email");

  //IF article not found return the rest 
if(!articleWithComment){
   return res.status(404).json({"message":"Article not found"})
}

//return rest 
res.status(201).json({
     message:"Comment added successfully",
     payload :articleWithComment	
});
});

//getting all the comments of an article
userRoute.get('/comments/:articleId', setAllowedRoles(["USER", "AUTHOR"]), verifyToken, async (req, res) => {

    let articleId = req.params.articleId;
    let article = await ArticleModel.findById(articleId).populate("comments.user", "firstName lastName email");

    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ payload: article.comments });
});




export default	userRoute
