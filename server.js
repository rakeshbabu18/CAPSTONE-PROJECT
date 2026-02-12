import exp from 'express'
import {connect}  from 'mongoose'
import {config} from 'dotenv'
import userRoute from './APIs/userAPI.js'
import adminRoute from './APIs/adminAPI.js'
import authorRoute from './APIs/authorAPI.js'
import { commonRouter}  from './APIs/commonAPI.js'
import cookieParser from "cookie-parser"
config() //process .env

const app=exp()
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
        console.log("connection successful!")

        app.listen(process.env.PORT,()=>{
        console.log("Server is running on port 4000")
        })
    }catch(err){
        console.log("connection failed!",err)
    }
}
connection()

//handling invalid path
app.use((req,res)=>{
    console.log(req.url)
    res.json({message:`${req.url} is invalid path`})
})




 

//error handling middleware
app.use((err,req,res,next)=>{
    console.log("err",err)

    res.json({message:"error",err})
    next()
})