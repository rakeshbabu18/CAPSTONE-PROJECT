import exp from 'express'
import {connect}  from 'mongoose'
import {config} from 'dotenv'
import userRoute from './APIs/userAPI.js'
import adminRoute from './APIs/adminAPI.js'
import authorRoute from './APIs/authorAPI.js'
import { commonRouter}  from './APIs/commonAPI.js'
import cookieParser from "cookie-parser"
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

config(); //process .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=exp()

app.use(cors({
  origin: ["http://localhost:5173", "https://capstone-project-kappa-silk.vercel.app", "https://capstone-project-1-4dn6.onrender.com"],
  credentials: true
}))



//add body parser middleware
app.use(exp.json())
app.use(cookieParser())

app.use('/users-api',userRoute)
app.use('/author-api',authorRoute)
app.use('/admin-api',adminRoute)
app.use('/common-api',commonRouter)

// Fallback to index.html for React Router (Single Page Application)
// Reverting to common name for the parameter as older/strict versions of path-to-regexp often want this
app.get('*any', (req, res, next) => {
    // If the request starts with any of our API prefixes, let it fall through to the 404 handler
    if (req.path.startsWith('/users-api') || 
        req.path.startsWith('/author-api') || 
        req.path.startsWith('/admin-api') || 
        req.path.startsWith('/common-api')) {
        return next();
    }
    // Otherwise, serve the frontend
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

// Serve frontend static files
app.use(exp.static(path.join(__dirname, '../Frontend/dist')));

//connect to database
const connection=async()=>{
    try{
    await connect(process.env.DB_URL)

    const port = process.env.PORT || 4000;
    app.listen(port,()=>{
     console.log(`Server running on port ${port}`)
     console.log(`connection successful`)
    })
}catch(err){
    console.error("DB connection failed:", err)
    process.exit(1)
}
}
connection()

//handling invalid path
app.use((req,res)=>{
    res.json({message:`${req.url} is invalid path`})
})



app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({
      message: err.message || "Request failed",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors,
    });
  }
  // Invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }
  // Duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate field value",
    });
  }
  res.status(500).json({
    message: "Internal Server Error",
  });
});