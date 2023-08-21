const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { UserModel } = require("../models/usermodel")
const { loginMiddleware } = require("../middlewares/login.middleware")
const { BlacklistModel } = require("../models/blacklistmodel")
const userRouter = express.Router()


userRouter.post("/register",async (req,res)=>{
    const {name,email,gender,password,age,city,is_married}= req.body
    try {
        const isUser = await UserModel.findOne({email})
        if(isUser){
            res.status(401).send({"error":"User already exists, please login"})
        }else{
            bcrypt.hash(password, 5, async (err, hash)=> {
                if(err){
                    res.status(500).send({"error":"internal server error"})
                }else if(!hash){
                    res.status(500).send({"error":"internal server error"})
                }else if(hash){
                    const newUser = new UserModel({email,password:hash,age,gender,name,city,is_married,posts:0})
                    await newUser.save()
                    res.send({"msg":"new user registered"})
                }
            });
        }
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})

userRouter.post("/login",loginMiddleware, async (req,res)=>{
    try {
     const token =    jwt.sign({
            userID:req.body.userID
          }, 'masai', { expiresIn: "7d" });
          res.send({"msg":"user logged in", "token":token, "posts":req.body.posts})
    } catch (error) {
    res.status(500).send({"error":"internal server error"})
    }
})



module.exports = {userRouter}