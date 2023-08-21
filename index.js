const express = require("express")
const cors = require("cors")
const { connection } = require("./db")
const { BlacklistModel } = require("./models/blacklistmodel")
const { userRouter } = require("./routes/userRoutes")
const { postRouter } = require("./routes/postRoutes")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/users",userRouter)
app.use("/posts",postRouter)

app.get("/",(req,res)=>{
    res.send("Home page")
})
app.get("/logout",async (req,res)=>{
    const token = req.headers?.authorization?.split(" ")[1]
    try {
        const newExToken = new BlacklistModel({"token":token})
        await newExToken.save()
        res.send({"msg":"user logged out"})
    } catch (error) {
        res.status(500).send({"error":"internal server error"})
    }
})

app.listen(8080,async ()=>{
    try {
      await connection 
      console.log("connected to db and running server")
    } catch (error) {
        console.log(error)
    }
})