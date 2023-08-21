const express = require("express")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { PostModel } = require("../models/postmodel")
const { UserModel } = require("../models/usermodel")
const postRouter = express.Router()

postRouter.get("/",authMiddleware, async (req,res)=>{
    let {page} = req.query
    if(!page){
        page = 1
    }
    let {min,max} = req.query
    //console.log(req.query)
    const query={}
    if(req.query.min && req.query.max){
        query.$and=[{no_of_comments:{$lte:req.query.max}},{no_of_comments:{$gte:req.query.min}}]
    }
   
    // if(req.query.page){
    //    // query.skip=(+(req.query.page)-1 )*3
    //     query.limit = 3
    // }

    if(req.query.device){
        query.device = req.query.device
    }
    if(req.query.device1){
        query.device1=req.query.device1
    }
    if(req.query.device3){
        query.device3=req.query.device3
    }

    try {
     let posts = await PostModel.find({"userID":req.body.userID,...query})
     posts = posts.slice((+page-1)*3, page*3)
      res.send(posts)
    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})   
    }
})
postRouter.post("/add",authMiddleware,async (req,res)=>{
    try {
        const newPost = new PostModel(req.body)
        const user = await UserModel.findOne({"_id":req.body.userID})
        const count = Number(user.posts)+1
 await UserModel.findByIdAndUpdate({_id:req.body.userID},{posts:count})
      const post =  await newPost.save()
        res.send({"msg":"new post added", "post":post})
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})

postRouter.patch("/update/:id",authMiddleware, async (req,res)=>{
    const {id}= req.params
    try {
        const post = await PostModel.findOne({_id:id})
        if(post.userID==req.body.userID){
            await PostModel.findByIdAndUpdate({_id:id},req.body)
            res.send({"msg":"post updated"})
        }else{
            res.status(403).send({"error":"you are not authorized"})
        }
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})

postRouter.delete("/delete/:id",authMiddleware, async (req,res)=>{
    const {id}= req.params
    try {
        const post = await PostModel.findOne({_id:id})
        if(post.userID==req.body.userID){
            await PostModel.findByIdAndDelete({_id:id},req.body)
            res.send({"msg":"post deleted"})
        }else{
            res.status(403).send({"error":"you are not authorized"})
        }
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})

postRouter.get("/top",authMiddleware,async (req,res)=>{
    let {page} = req.query
    if(!page){
        page = 1
    }
    try {
        let posts = await PostModel.find({userID:req.body.userID})
        console.log(posts)
        posts.sort((a,b)=>{
            return b.no_of_comments-a.no_of_comments
        })
        posts = posts.slice((+page-1)*3, page*3)

        res.send(posts)
    } catch (error) {
        console.log(error)
        res.status(500).send({"error":"internal server error"})
    }
})
module.exports = {postRouter}