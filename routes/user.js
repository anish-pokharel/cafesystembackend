const express = require ('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const nodemailer = require ('nodemailer');



router.post('/signup',(req,res)=>{
let user = req.body;
query ="select email, password ,role ,status from user where email =?"
connection.query(query,[user.email],(err,results)=>{

    if (!err){
        if(results.length<=0){
            query ="insert into user (name,contactNumber,email,password,status ,role) values(?,?,?,?,'false','user')";
            connection.query(query,[user.name,user.contactNumber,user.name,user.password],(err,results)=>{
                if(!err){
                    return res.status(200).json({message :"sign up sucessful "})
                }
                else{
                    return res.status(500).json(err)
                }
            })
    }
        else{
            return res.status(400).json({message :"Email already access"});
        }
    }
    else{
        return res.status(500).json(err);
    }
});
})

router.post('/login',(req,res)=>{
    const user = req.body;
    query ="select email,password,role,status from user where email =?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<=0 || results[0].password!=user.password){
                return res.status(401).json({message:"Incorrected User"})
            }
            else if (results[0].status=== 'false'){
                return res.status(401).json({message :"wait for admin approval "});

            }
            else if(results[0].password == user.password){
                const response ={
                    email:results[0].email,role:results[0].role
                }
                const accessToken =jwt.sign(response, process.env.ACCESS_TOKEN,{expiresIn:'8h'});
                res.status(200).json({token: accessToken})
            }
            else{
                return res.status(400).json({message:"wrong "})
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})



var transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})
router.post('/forgetpassword',(req,res)=>{
    const user= req.body;
    query= "select email,password from user where email=?";
    connection.query(query,[user.email],(err, results)=>{
        if(!err){
            if(results.length<=0){
                return res.status(200).json({message:"password sent to sucessful to email"});
            }
            else{
                var mailOptions ={
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: "password forgot of cafe management ",
                    html:'<p> email  <b> </b>  ' +results[0].email+ '</p>'+results[0].password+ '<p> <a href="http://localhost:4200/">click here to login </a> </p>',
                };
                transport.sendMail(mailOptions,function(error,info){
                    if(error){
                        console.log(err);
                    }
                    else{
                        console.log("email sent "+info.response)
                    }
                     
               })
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports= router;