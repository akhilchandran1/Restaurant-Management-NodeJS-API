const express = require("express");
const connection = require("../connection/connection");
const router = express.Router();
require("dotenv").config();

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

router.get("/login", (req, res, next) => {
    console.log(req.body);
    return res.json({message: "login success"})
});

module.exports = router;