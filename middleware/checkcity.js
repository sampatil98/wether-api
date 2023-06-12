//middle ware to check given city is string or not

const checkcity= (req,res,next)=>{
    let {city}=req.body;

    let regex= /^[a-zA-Z]+$/
    if(regex.test(city)){
        next();
    }else{
        req.status(400).send({"error":"Invalid City Name"});
    }
}
module.exports={checkcity};