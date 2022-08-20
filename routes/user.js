const express = require("express");
const connection = require("../connection/connection");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");



router.post("/signup", (req, res, next) => {
    let user = req.body;
    let query = "SELECT email, password, role, status FROM "+process.env.DB_TABLE+" WHERE email=?";
    connection.query(query,[user.email], (err, results) => {
        if(!err){
            if(results.length <= 0){
                query = "INSERT INTO "+process.env.DB_TABLE+" (name, contactNumber, email, password, status, role) VALUES (?,?,?,?, 'false', 'user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if(!err){
                        return res.status(200).json({message: "Successfully Registered"});
                    }else{
                        return res.status(500).json(err);
                    }
                });
            }else{
                return res.status(400).json({message: "Email ID already exist"});
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

router.post("/login", (req, res, next) => {
    const user = req.body;
    const query = "SELECT email, password, status, role FROM "+process.env.DB_TABLE+" WHERE email=?";
    connection.query(query, [user.email], (err, results) => {
        if(!err){
            if(results.length <= 0 || results[0].password != user.password){
                return res.status(401).json({message: "Incurrect Username of Password"});
            }else if(results[0].status === "false"){
                return res.status(401).json({message: "Wait for Admin Approval"});
            }else if(results[0].password == user.password){
                const response = {email: results[0].email, role: results[0].role};
                const accessToken = jsonwebtoken.sign(response, process.env.ACCESS_TOKEN, {expiresIn: "9h"});
                res.status(200).json({token: accessToken});
            }else{
                return res.status(400).json({message: "Something went wrong. Please try again later"});
            }
        }else{
            return res.status(500).json(err);
        }
    });
});

var transporter = nodemailer.createTransport({
    service: "gmail.com",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

router.post("/forgotPassword", (req, res, next) => {
    const user = req.body;
    const query = "SELECT email, password FROM "+process.env.DB_TABLE+" WHERE email=?";
    connection.query(query,[user.email], (err, results) => {
        if(!err){
            if(results.length <= 0){
                return res.status(200).json({message: "Password sent successfully to your email."});
            }else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: "Password by Restaurant management system",
                    html: "<p><b>Your login details for your Restaurant management system<b><br><b>Email: </b>"+results[0].email+"<br><b>Password: </b>"+results[0].password+"<br><a href='http://localhost:4200/'>Click here to login</a></p>"
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Email sent: "+info.response)
                    }
                });
                return res.status(200).json({message: "Password sent successfully to your email."});
            }
        }else{
            return res.status(500).json(err);
        }
    })
});

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const query = "SELECT id, name, email, contactNumber, status FROM "+process.env.DB_TABLE+" WHERE role='user'";
    connection.query(query, (err, results) => {
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    });
});

router.patch("/update", auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const user = req.body;
    const query = "UPDATE "+process.env.DB_TABLE+" SET status=? WHERE id=?";
    connection.query(query,[user.status, user.id], (err, results) => {
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: "User ID does not exixt"});
            }
            return res.status(200).json({message: "User updated successfully"})
        }else{

        }
    })
});

router.get("/checkToken", auth.authenticateToken, (req, res, next) => {
    return res.status(200).json({message: true});
});

router.post("/changePassword",(req, res, next) => {

});
// 1:29:38

module.exports = router;