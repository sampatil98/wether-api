const { Router } = require("express");
const { UserModel } = require("../model/user.model");
const jwt = require("jsonwebtoken");
const { checkcity } = require("../middleware/checkcity");
require("dotenv").config();
const userroute = Router();
const axios=require(axios);

const winston=require("winston");
require("winston-mongodb");

const Redis = require("ioredis");

const redis = new Redis();

const mongoTransport= new winston.transports.MongoDB({
    db:"wether-APP",
    collection:"errorlogs"
})

const logger= winstone.createLogger({
    level:"error",
    transports:[
        mongoTransport
    ]
})


userroute.post("/register", async (req, res) => {
    const { name, email, password, city } = req.body;
    try {
        const data = new UserModel(req.body);
        await data.save();
        res.status(200).send({ "msg": "user added" });


    } catch (err) {
        logger.error(err);
        res.status(400).send({ "error": err });
    }
});

userroute.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });

        if (user) {
            if (user.password == password) {
                let token = jwt.sign({ userId: user._id }, process.env.secretkey, { expiresIn: 60 * 60 });

                res.status(200).send({ "msg": "login in successful", "token": token });

            } else {
                res.status(400).send({ "error": "Wrong password" })
            }
        } else {
            res.status(400).send({ "error": "user not found please register first" });
        }

    } catch (err) {
        res.status(400).send({ "error": err });
    }
});

userroute.post("/weather", checkcity, async (req, res) => {
    const { city } = req.body;
    try {
        redis.get(city, async(err, result) => {
            if (result) {
               return res.status(200).send(result);
            }else{
                const api=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.APIKEY}`;
                const data=await axios.get(api);
                let weatherdata=data.data;
                console.log(weatherdata);
                redis.set(city,weatherdata,"EX",30*60);
                res.send(weatherdata);
                

            }
            
                

        });
    } catch (err) {
        res.status(400).send({ "error": err });
    }
    });

userroute.get("/logout", (req, res) => {
    let token = req.headers.authorization;

    try {
         token_data=token.splity(" ")[1];
         redis.set(blacklist,token_data);
         res.status(200).send("logged out")

    } catch (err) {
        logger.error(err);
    }
});


module.exports = { userroute }