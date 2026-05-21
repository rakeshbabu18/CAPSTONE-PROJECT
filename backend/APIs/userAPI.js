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

                // Input validation
                if (!userObj.firstName || !userObj.lastName || !userObj.email || !userObj.password) {
                    return res.status(400).json({ message: "All fields (firstName, lastName, email, password) are required" });
                }

                // Check for existing user
                const existingUser = await UserTypeModel.findOne({ email: userObj.email });
                if (existingUser) {
                    return res.status(409).json({ message: "User with this email already exists" });
                }

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

//Read Articles (Publicly accessible)
userRoute.get('/articles', async (req, res) => {
    console.log("GET /articles request received");
    try {
        let articles = await ArticleModel
            .find({ isArticleActive: true })
            .populate("author", "firstName lastName")
            .sort({ createdAt: -1 });

        res.status(200).json({ message: "Articles found", payload: articles });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch articles", error: err.message });
    }
})


//Read Article by ID (Publicly accessible)
userRoute.get('/article/:id', async (req, res) => {
    try {
        let articleId = req.params.id;
        let article = await ArticleModel.findById(articleId)
            .populate("author", "firstName lastName email")
            .populate({
                path: 'comments.user',
                select: 'firstName lastName profileImageUrl'
            });
            
        if (!article || !article.isArticleActive) {
            return res.status(404).json({ error: "Article not found" });
        }
        
        res.status(200).json({ payload: article });
    } catch (err) {
        res.status(500).json({ message: "Error fetching article", error: err.message });
    }
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

//getting all the comments of an article (Publicly accessible)
userRoute.get('/comments/:articleId', async (req, res) => {
    try {
        let articleId = req.params.articleId;
        let article = await ArticleModel.findById(articleId).populate("comments.user", "firstName lastName email profileImageUrl");

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.status(200).json({ payload: article.comments });
    } catch (err) {
        res.status(500).json({ message: "Error fetching comments", error: err.message });
    }
});




export default	userRoute
