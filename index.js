// import http from "http"

// const server = http.createServer((req,res) => { //we can write html also

//     if(req.url === "/about"){
//         res.end("<h1>About Page</h1>")
//     }
//     else if(req.url === "/"){
//         res.end("<h1>Nice</h1>")
//     }
//     else if(req.url === "/contact"){
//         res.end("<h1>contact Page</h1>")
//     }
//     else{
//         res.end("<h1>Page Not Found</h1>")
//     }
// })

// //server.listen(serverport , hostname)
// server.listen(3030 , () => {
//     console.log('server s working')
// })


// Express Starting

import express, { urlencoded } from 'express'
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';  
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"

//MongoDB
mongoose.connect("mongodb://localhost:27017" , {
    dbName : "Backend",
}).then(() => console.log("Database connected")).catch((e) => console.log(e))

const app = express();

//Schema what to fill in database
// ye index.ejs k file hai
// const messageSchema = new mongoose.Schema({
//     name : String,
//     email : String,
// })

//login schema ye hai
const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
})

const User = mongoose.model("User" , userSchema)

// as it is
app.set("view engine" , "ejs")

const isAuthenticated =  async (req,res,next) => {
    const {token} = req.cookies;
    
   

    if(token){
        const decoded =  jwt.verify(token , "dfk;jvbef'vbnf")

        req.user = await User.findById(decoded._id)
       next()
    } else{
        res.redirect("/login")
    }
}

// to access static file 
app.use(express.static(path.join(path.resolve(), "public")))
app.use(express. urlencoded({extended : true}))
app.use(cookieParser())

app.get("/" , isAuthenticated ,  (req,res) => {

    res.render("logout")

    // const {token} = req.cookies;

    // if(token){
    //     res.render("logout")
    // } else{
    //     res.render("login")
    // }
   
// res.sendFile("index") static file
})

app.post("/login" , async (req,res) => {

    const{email,password} = req.body;

    let user = await User.findOne({email})

    if(!user) return res.redirect("/register")

    // const isMatch = user.password === password;

    const isMatch = await bcrypt.compare(password,user.password)


    if(!isMatch)return res.render("login" , {email,message : "Incorrect Password"})

    const token = jwt.sign({_id:user._id},"dfk;jvbef'vbnf")
    res.cookie("token",token, {
        httpOnly : true,
        expires : new Date(Date.now() + 60*1000)
    })
    res.redirect("/")
})

app.get("/register" , (req,res) => {
    res.render("register")
})
// LOGIN

 app.post("/register", async (req,res) => {

    const {name,email,password} = req.body;
    let user = await User.findOne({email})

    if(user){
    return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password,10)
     user = await User.create({
        name,email,
        password : hashedPassword
    })

    const token = jwt.sign({_id:user._id},"dfk;jvbef'vbnf")
    res.cookie("token",token, {
        httpOnly : true,
        expires : new Date(Date.now() + 60*1000)
    })
    res.redirect("/")
 })

 //LOGIN
 app.get("/login" , (req,res) => {
    res.render("login")
 })

//LOGOUT
 app.get("/logout" , (req,res) => {
    res.cookie("token" , null , {
        expires: new Date(Date.now())
    })
    res.redirect("/")
 })

// app.post("/contact" , async (req,res) => {   
// //   const messageData = {username : req.body.name , email : req.body.email}  
//   console.log(req.body)
//  await Messge.create({name : req.body.name , email : req.body.email})
// //  console.log(messageData)
//    res.redirect("/success")
//  })
 
// app.get("/add" , async (req,res) => {
//     await Message.create({
//         name : "Sanyam",
//         email : "sanyamkhatri3@gmail.com"
//     })
//  })


app.listen(3030, () => {
    console.log('sever is working')
})