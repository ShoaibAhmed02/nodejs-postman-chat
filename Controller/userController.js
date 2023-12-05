const User = require("../Models/User")

const userSaved= async(req,res)=>{
    if(!req.user.name)
        res.status(400).send({status:0,message:"Please provide your name!"})
    else if(!req.user.email)
        res.status(400).send({status:0,message:"Please provide your email!"})

    const data= new User(req.body);
    const save = await data.save();
    if(save)
        res.status(200).send({status:1,message:"User Successfully added!"})
    else 
    res.status(400).send({status:0,message:"User Failed to add!"})
}

module.exports={userSaved}