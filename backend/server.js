import exp from 'express'
import {connect}  from 'mongoose'
import {config} from 'dotenv'
import userRoute from './APIs/userAPI.js'
import adminRoute from './APIs/adminAPI.js'
import authorRoute from './APIs/authorAPI.js'
import { commonRouter}  from './APIs/commonAPI.js'
import cookieParser from "cookie-parser"
import cors from 'cors';
config(); //process .env

const app=exp()

app.use(cors({origin:["http://localhost:5173"],credentials:true}))



//add body parser middleware
app.use(exp.json())
app.use(cookieParser())

app.use('/users-api',userRoute)
app.use('/author-api',authorRoute)
app.use('/admin-api',adminRoute)
app.use('/common-api',commonRouter)

//connect to database

    const connection=async()=>{
        try{
        await connect(process.env.DB_URL)

        app.listen(process.env.PORT,()=>{
         console.log(`Server running on port ${process.env.PORT}`)
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