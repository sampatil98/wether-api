const express=require("express");
const {connection}=require("./config/db");
const {userroute}=require("./routes/user.route");



require("dotenv").config();

const app=express();
app.use(express.json());

app.use("/user",userroute);




app.listen(process.env.port, async ()=>{

    try{
        await connection;
        console.log("connected to DB");
        console.log(`server is running on port ${process.env.port}` );

    }catch(err){
        console.log(err);
    }

})